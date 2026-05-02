"use client"

import { useEffect, useMemo, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  DollarSign,
  Download,
  Loader2,
  Package,
  Settings2,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getManagerBranches, getReportsSummary } from "@/lib/manager-data-api"
import type { Branch } from "@/lib/manager-types"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type ReportWidget = "kpi" | "channels" | "revenueTrend" | "channelTrend" | "categories" | "topProducts"

const REPORT_WIDGET_STORAGE_KEY = "manager_report_widgets"
const DEFAULT_WIDGETS: ReportWidget[] = ["kpi", "channels", "revenueTrend", "channelTrend", "topProducts"]

const widgetOptions: Array<{ key: ReportWidget; label: string }> = [
  { key: "kpi", label: "KPI tổng quan" },
  { key: "channels", label: "Online / cửa hàng" },
  { key: "revenueTrend", label: "Xu hướng doanh thu" },
  { key: "channelTrend", label: "Xu hướng kênh bán" },
  { key: "categories", label: "Doanh số theo danh mục" },
  { key: "topProducts", label: "Sản phẩm bán chạy" },
]

interface ReportsState {
  kpi: {
    totalRevenue: number
    revenueChange: number
    totalOrders: number
    ordersChange: number
    totalCustomers: number
    customersChange: number
    avgOrderValue: number
    avgOrderChange: number
  }
  categoryDistribution: Array<{ name: string; value: number }>
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
    customers: number
    products: number
  }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
}

function getStoredWidgets(): ReportWidget[] {
  if (typeof window === "undefined") return DEFAULT_WIDGETS

  try {
    const raw = window.localStorage.getItem(REPORT_WIDGET_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed)) return DEFAULT_WIDGETS

    const allowed = new Set(widgetOptions.map((option) => option.key))
    const widgets = parsed.filter((item): item is ReportWidget => allowed.has(item))
    return widgets.length ? widgets : DEFAULT_WIDGETS
  } catch {
    return DEFAULT_WIDGETS
  }
}

function currency(value: number) {
  return `$${value.toLocaleString()}`
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportsState | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchId, setBranchId] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [visibleWidgets, setVisibleWidgets] = useState<ReportWidget[]>(DEFAULT_WIDGETS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setVisibleWidgets(getStoredWidgets())
  }, [])

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [response, branchResponse] = await Promise.all([
          getReportsSummary({ branchId, startDate, endDate }),
          getManagerBranches(),
        ])
        setReports(response.metadata)
        setBranches(branchResponse.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu báo cáo"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadReports()
  }, [branchId, startDate, endDate])

  const selectedWidgets = useMemo(() => new Set(visibleWidgets), [visibleWidgets])

  const setWidgetVisibility = (widget: ReportWidget, checked: boolean) => {
    const next = checked
      ? [...visibleWidgets, widget]
      : visibleWidgets.filter((item) => item !== widget)

    setVisibleWidgets(next)
    window.localStorage.setItem(REPORT_WIDGET_STORAGE_KEY, JSON.stringify(next))
  }

  const resetWidgets = () => {
    setVisibleWidgets(DEFAULT_WIDGETS)
    window.localStorage.setItem(REPORT_WIDGET_STORAGE_KEY, JSON.stringify(DEFAULT_WIDGETS))
  }

  return (
    <div className="min-h-screen">
      <Topbar
        title="Tổng quan báo cáo"
        description="Một màn báo cáo duy nhất, manager tự chọn những khối cần theo dõi."
      />

      <main className="p-6 space-y-6">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-violet-500/15 via-background to-background p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Reports Mode
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Báo cáo gọn lại một nơi
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Không tách riêng dashboard và tổng quan nữa. Các chỉ số vận hành, đơn online, đơn tại cửa hàng và phân tích doanh thu đều nằm ở đây, có thể bật tắt theo nhu cầu của manager.
              </p>
            </div>

            <Card className="w-full border-border bg-card xl:max-w-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4" />
                  Tùy chỉnh hiển thị
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={resetWidgets}>
                    Mặc định
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Xuất
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {widgetOptions.map((option) => (
                  <label key={option.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                    <Checkbox
                      checked={selectedWidgets.has(option.key)}
                      onCheckedChange={(checked) => setWidgetVisibility(option.key, checked === true)}
                    />
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
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

        {isLoading || !reports ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {selectedWidgets.has("kpi") ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                        <p className="text-2xl font-bold">{currency(reports.kpi.totalRevenue)}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-success">+{reports.kpi.revenueChange}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                        <p className="text-2xl font-bold">{reports.kpi.totalOrders.toLocaleString()}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                        <ShoppingCart className="h-5 w-5 text-chart-2" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-success">+{reports.kpi.ordersChange}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Khách hàng mới</p>
                        <p className="text-2xl font-bold">{reports.kpi.totalCustomers.toLocaleString()}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                        <Users className="h-5 w-5 text-chart-3" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-success">+{reports.kpi.customersChange}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Giá trị đơn TB</p>
                        <p className="text-2xl font-bold">{currency(reports.kpi.avgOrderValue)}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                        <Package className="h-5 w-5 text-chart-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">{reports.kpi.avgOrderChange}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {selectedWidgets.has("channels") ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card border-border">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">Đơn online</p>
                      <p className="mt-1 text-3xl font-semibold text-foreground">
                        {reports.orderChannels.online.orders.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {currency(reports.orderChannels.online.revenue)} doanh thu
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">Đơn tại cửa hàng</p>
                      <p className="mt-1 text-3xl font-semibold text-foreground">
                        {reports.orderChannels.store.orders.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {currency(reports.orderChannels.store.revenue)} doanh thu
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                      <Store className="h-6 w-6 text-chart-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              {selectedWidgets.has("revenueTrend") ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Xu hướng doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reports.monthlyData}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [currency(value), "Doanh thu"]} />
                          <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {selectedWidgets.has("channelTrend") ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Đơn hàng online / tại cửa hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reports.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                          <Legend />
                          <Line type="monotone" dataKey="onlineOrders" name="Online" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="storeOrders" name="Tại cửa hàng" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {selectedWidgets.has("categories") ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Doanh số theo danh mục</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={reports.categoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                            {reports.categoryDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [`${value}%`, "Tỷ trọng"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {reports.categoryDistribution.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                            <span className="text-muted-foreground">{category.name}</span>
                          </div>
                          <span className="font-medium">{category.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {selectedWidgets.has("topProducts") ? (
                <Card className="bg-card border-border lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Sản phẩm bán chạy nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports.topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={150} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number, name: string) => [name === "revenue" ? currency(value) : value, name === "revenue" ? "Doanh thu" : "Số lượng bán"]} />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
