"use client"

import { useEffect, useState } from "react"
import { Building2, Edit, Loader2, MoreHorizontal, Package, Plus, Store, Users } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getErrorMessage } from "@/lib/api"
import { createManagerBranch, getManagerBranches, updateManagerBranch } from "@/lib/manager-data-api"
import type { Branch } from "@/lib/manager-types"

const emptyForm = {
  name: "",
  code: "",
  address: "",
  phone: "",
  status: "active" as Branch["status"],
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const loadBranches = async () => {
    try {
      setIsLoading(true)
      const response = await getManagerBranches()
      setBranches(response.metadata)
      setError("")
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Không thể tải chi nhánh"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBranches()
  }, [])

  const openCreateForm = () => {
    setEditingBranch(null)
    setFormData(emptyForm)
    setFormOpen(true)
  }

  const openEditForm = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      status: branch.status,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const payload = {
        ...formData,
        status: formData.status.toUpperCase() as unknown as Branch["status"],
      }

      if (editingBranch) {
        const response = await updateManagerBranch(editingBranch.id, payload)
        setBranches((prev) => prev.map((branch) => branch.id === editingBranch.id ? response.metadata : branch))
      } else {
        const response = await createManagerBranch(payload)
        setBranches((prev) => [...prev, response.metadata])
      }

      setFormOpen(false)
      setEditingBranch(null)
      setFormData(emptyForm)
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, editingBranch ? "Không thể cập nhật chi nhánh" : "Không thể tạo chi nhánh"))
    }
  }

  const columns = [
    {
      key: "name" as const,
      header: "Cửa hàng / Chi nhánh",
      render: (branch: Branch) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{branch.name}</p>
            <p className="text-sm text-muted-foreground">{branch.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "address" as const,
      header: "Địa chỉ cửa hàng",
      render: (branch: Branch) => <span className="text-muted-foreground">{branch.address || "Chưa cập nhật"}</span>,
    },
    {
      key: "phone" as const,
      header: "Điện thoại",
      render: (branch: Branch) => <span className="text-muted-foreground">{branch.phone || "Chưa cập nhật"}</span>,
    },
    { key: "staffCount" as const, header: "Nhân viên", render: (branch: Branch) => <span className="font-medium">{branch.staffCount}</span> },
    { key: "inventoryItems" as const, header: "Dòng kho", render: (branch: Branch) => <span className="font-medium">{branch.inventoryItems}</span> },
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
      <Topbar title="Chi nhánh" description="Mỗi địa chỉ cửa hàng là một chi nhánh và có kho riêng." />
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
                <p className="text-sm text-muted-foreground">Địa chỉ cửa hàng</p>
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
                <p className="text-sm text-muted-foreground">Dòng kho riêng</p>
                <p className="mt-1 text-2xl font-bold">{branches.reduce((sum, branch) => sum + branch.inventoryItems, 0)}</p>
              </div>
              <Package className="h-5 w-5 text-chart-3" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Danh sách địa chỉ cửa hàng</h2>
                <p className="text-sm text-muted-foreground">Tạo chi nhánh theo từng địa chỉ để quản lý nhân viên và tồn kho riêng.</p>
              </div>
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chi nhánh
              </Button>
            </div>
            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={branches}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Tìm chi nhánh..."
                actions={(branch) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditForm(branch)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
            <DialogDescription>
              Mỗi chi nhánh tương ứng với một địa chỉ cửa hàng và có kho tồn riêng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="branch-name">Tên cửa hàng / chi nhánh</Label>
              <Input
                id="branch-name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="VD: GuitarHub Quận 1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-code">Mã chi nhánh</Label>
              <Input
                id="branch-code"
                value={formData.code}
                onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                placeholder="VD: Q1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-address">Địa chỉ cửa hàng</Label>
              <Input
                id="branch-address"
                value={formData.address}
                onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="VD: 12 Nguyễn Huệ, Quận 1, TP.HCM"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-phone">Số điện thoại</Label>
              <Input
                id="branch-phone"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="VD: 0901234567"
              />
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Branch["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {editingBranch ? "Cập nhật" : "Tạo chi nhánh"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
