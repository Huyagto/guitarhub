"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Download, DollarSign, Loader2, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getReportsSummary } from "@/lib/manager-data-api"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
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
  monthlyData: Array<{ month: string; sales: number; orders: number; customers: number; products: number }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("year")
  const [reportType, setReportType] = useState("sales")
  const [reports, setReports] = useState<ReportsState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await getReportsSummary()
        setReports(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu báo cáo"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadReports()
  }, [])

  return (
    <div className="min-h-screen">
      <Topbar title="Trung tâm báo cáo" description="Phân tích số liệu, xu hướng tăng trưởng và hiệu quả vận hành trong một khu phân tích riêng." />

      <main className="p-6 space-y-6">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-violet-500/15 via-background to-background p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Reports Mode
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Khu phân tích và thống kê
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Đây là workspace dành cho các quyết định dựa trên dữ liệu. Bạn có thể so sánh doanh thu, hành vi khách hàng và hiệu quả sản phẩm mà không bị lẫn với màn vận hành thường ngày.
            </p>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Báo cáo doanh thu</SelectItem>
                <SelectItem value="products">Báo cáo sản phẩm</SelectItem>
                <SelectItem value="customers">Báo cáo khách hàng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 ngày gần nhất</SelectItem>
                <SelectItem value="month">30 ngày gần nhất</SelectItem>
                <SelectItem value="quarter">Quý gần nhất</SelectItem>
                <SelectItem value="year">1 năm gần nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading || !reports ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                      <p className="text-2xl font-bold">${reports.kpi.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success">+{reports.kpi.revenueChange}%</span>
                    <span className="text-muted-foreground">so với kỳ trước</span>
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
                    <span className="text-muted-foreground">so với kỳ trước</span>
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
                    <span className="text-muted-foreground">so với kỳ trước</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Giá trị đơn trung bình</p>
                      <p className="text-2xl font-bold">${reports.kpi.avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <Package className="h-5 w-5 text-chart-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{reports.kpi.avgOrderChange}%</span>
                    <span className="text-muted-foreground">so với kỳ trước</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
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
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Doanh thu"]} />
                        <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Đơn hàng và khách hàng mới</CardTitle>
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
                        <Line type="monotone" dataKey="orders" name="Đơn hàng" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="customers" name="Khách hàng" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
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
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} formatter={(value: number, name: string) => [name === "revenue" ? `$${value.toLocaleString()}` : value, name === "revenue" ? "Doanh thu" : "Số lượng bán"]} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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
