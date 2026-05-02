"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Loader2, ShoppingCart, Store } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage } from "@/lib/api"
import { getManagerBranches, getReportsSummary } from "@/lib/manager-data-api"
import type { Branch } from "@/lib/manager-types"

interface OrdersReportState {
  orderChannels: {
    online: { orders: number; revenue: number }
    store: { orders: number; revenue: number }
  }
  monthlyData: Array<{
    month: string
    sales: number
    orders: number
    onlineOrders: number
    storeOrders: number
    onlineRevenue: number
    storeRevenue: number
  }>
}

function currency(value: number) {
  return `$${value.toLocaleString()}`
}

export default function OrdersReportPage() {
  const [report, setReport] = useState<OrdersReportState | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchId, setBranchId] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadReport = async () => {
      try {
        const [response, branchResponse] = await Promise.all([
          getReportsSummary({ branchId, startDate, endDate }),
          getManagerBranches(),
        ])
        setReport(response.metadata)
        setBranches(branchResponse.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải báo cáo đơn hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadReport()
  }, [branchId, startDate, endDate])

  return (
    <div className="min-h-screen">
      <Topbar
        title="Báo cáo đơn hàng"
        description="Thống kê đơn online và đơn tại cửa hàng trong Reports, tách khỏi màn quản lý đơn hàng của Customer mode."
      />

      <main className="space-y-6 p-6">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-violet-500/15 via-background to-background p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Reports Mode
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Phân tích đơn hàng
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Trang này chỉ dùng để xem thống kê. Các thao tác xác nhận, giao hàng hoặc hủy đơn vẫn nằm trong Customer mode.
            </p>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger>
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>

        {isLoading || !report ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Đơn online</p>
                    <p className="mt-1 text-3xl font-semibold text-foreground">
                      {report.orderChannels.online.orders.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currency(report.orderChannels.online.revenue)} doanh thu
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Đơn tại cửa hàng</p>
                    <p className="mt-1 text-3xl font-semibold text-foreground">
                      {report.orderChannels.store.orders.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currency(report.orderChannels.store.revenue)} doanh thu
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                    <Store className="h-6 w-6 text-chart-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Doanh thu theo kênh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={report.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => currency(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="onlineRevenue" name="Online" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.18} strokeWidth={2} />
                        <Area type="monotone" dataKey="storeRevenue" name="Tại cửa hàng" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.18} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Số đơn theo kênh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                        <Legend />
                        <Bar dataKey="onlineOrders" name="Online" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="storeOrders" name="Tại cửa hàng" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
