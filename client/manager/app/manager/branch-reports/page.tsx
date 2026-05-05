"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, Building2, CalendarDays, Loader2, ShoppingCart, Store, Warehouse } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/api"
import { getManagerBranches, getManagerInventoryByBranch, getReportsSummary } from "@/lib/manager-data-api"
import type { Branch, InventoryItem } from "@/lib/manager-types"

type ReportSummary = Awaited<ReturnType<typeof getReportsSummary>>["metadata"]

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
}

export default function BranchReportsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [branchId, setBranchId] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [branchesRes, summaryRes, inventoryRes] = await Promise.all([
          getManagerBranches(),
          getReportsSummary({ branchId, startDate, endDate }),
          getManagerInventoryByBranch(branchId),
        ])

        setBranches(branchesRes.metadata)
        setSummary(summaryRes.metadata)
        setInventory(inventoryRes.metadata)
        setError("")
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải báo cáo chi nhánh"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [branchId, startDate, endDate])

  const selectedBranch = branches.find((branch) => branch.id === branchId)
  const totalStock = useMemo(() => inventory.reduce((sum, item) => sum + item.stock, 0), [inventory])
  const lowStockItems = useMemo(() => inventory.filter((item) => item.stock > 0 && item.stock <= item.minStock).length, [inventory])
  const outOfStockItems = useMemo(() => inventory.filter((item) => item.stock === 0).length, [inventory])

  return (
    <div className="min-h-screen">
      <Topbar
        title="Báo cáo chi nhánh"
        description="Theo dõi doanh thu, đơn hàng, tồn kho và hiệu suất theo từng địa chỉ cửa hàng."
      />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card className="border-border bg-card">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1.3fr_1fr_1fr]">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Chi nhánh / địa chỉ cửa hàng</label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(summary.kpi.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{selectedBranch?.name || "Tất cả chi nhánh"}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{summary.kpi.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Online và tại cửa hàng</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng tồn kho</CardTitle>
                  <Warehouse className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalStock}</p>
                  <p className="text-xs text-muted-foreground">{inventory.length} dòng sản phẩm</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cảnh báo kho</CardTitle>
                  <Store className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{lowStockItems + outOfStockItems}</p>
                  <p className="text-xs text-muted-foreground">{lowStockItems} sắp hết, {outOfStockItems} hết hàng</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    So sánh chi nhánh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chi nhánh</TableHead>
                        <TableHead>Đơn</TableHead>
                        <TableHead>Online</TableHead>
                        <TableHead>Tại cửa hàng</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.branchBreakdown.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Chưa có dữ liệu báo cáo cho bộ lọc này.
                          </TableCell>
                        </TableRow>
                      ) : (
                        summary.branchBreakdown.map((branch) => (
                          <TableRow key={branch.branchId}>
                            <TableCell>
                              <div className="font-medium">{branch.branchName}</div>
                              <div className="text-xs text-muted-foreground">{branch.branchCode}</div>
                            </TableCell>
                            <TableCell>{branch.orders}</TableCell>
                            <TableCell>{branch.onlineOrders}</TableCell>
                            <TableCell>{branch.storeOrders}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(branch.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Kho theo bộ lọc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inventory.slice(0, 8).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.branchName || "Tổng chi nhánh"}</p>
                      </div>
                      <span className="text-sm font-semibold">{item.stock}</span>
                    </div>
                  ))}
                  {inventory.length === 0 ? (
                    <p className="rounded-lg bg-muted px-3 py-4 text-center text-sm text-muted-foreground">
                      Chưa có dữ liệu kho.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
