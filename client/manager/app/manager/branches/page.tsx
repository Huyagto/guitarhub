"use client"

import { useEffect, useState } from "react"
import { Building2, Loader2, Package, Users } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getErrorMessage } from "@/lib/api"
import { getManagerBranches } from "@/lib/manager-data-api"
import type { Branch } from "@/lib/manager-types"

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await getManagerBranches()
        setBranches(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải chi nhánh"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBranches()
  }, [])

  const columns = [
    {
      key: "name" as const,
      header: "Chi nhánh",
      render: (branch: Branch) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{branch.name}</p>
            <p className="text-sm text-muted-foreground">{branch.code}</p>
          </div>
        </div>
      ),
    },
    { key: "address" as const, header: "Địa chỉ", render: (branch: Branch) => <span className="text-muted-foreground">{branch.address || "Chưa cập nhật"}</span> },
    { key: "phone" as const, header: "Điện thoại", render: (branch: Branch) => <span className="text-muted-foreground">{branch.phone || "Chưa cập nhật"}</span> },
    { key: "staffCount" as const, header: "Nhân viên", render: (branch: Branch) => <span className="font-medium">{branch.staffCount}</span> },
    { key: "inventoryItems" as const, header: "Mặt hàng kho", render: (branch: Branch) => <span className="font-medium">{branch.inventoryItems}</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (branch: Branch) => (
        <Badge variant="outline" className={branch.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-border bg-muted text-muted-foreground"}>
          {branch.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Chi nhánh" description="Quản lý chi nhánh, nhân viên theo chi nhánh và kho từng chi nhánh." />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Tổng chi nhánh</p>
                <p className="mt-1 text-2xl font-bold">{branches.length}</p>
              </div>
              <Building2 className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Nhân viên đã gán</p>
                <p className="mt-1 text-2xl font-bold">{branches.reduce((sum, branch) => sum + branch.staffCount, 0)}</p>
              </div>
              <Users className="h-5 w-5 text-chart-2" />
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Dòng tồn kho</p>
                <p className="mt-1 text-2xl font-bold">{branches.reduce((sum, branch) => sum + branch.inventoryItems, 0)}</p>
              </div>
              <Package className="h-5 w-5 text-chart-3" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable data={branches} columns={columns} searchKey="name" searchPlaceholder="Tìm chi nhánh..." />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
