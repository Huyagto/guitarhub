"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, DollarSign, Loader2, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api"
import { getDashboardOverview } from "@/lib/manager-data-api"
import type { InventoryItem, Order } from "@/lib/manager-types"

interface DashboardState {
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
  salesChartData: Array<{ month: string; sales: number; orders: number }>
  categoryDistribution: Array<{ name: string; value: number; fill: string }>
  recentOrders: Order[]
  lowStockItems: InventoryItem[]
}

export default function ManagerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboardOverview()
        setDashboard(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu dashboard"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  return (
    <div className="min-h-screen">
      <Topbar title="Bảng điều hành staff" description="Theo dõi vận hành cửa hàng, sản phẩm và tồn kho trong một khu làm việc riêng." />

      <main className="p-6 space-y-6">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-amber-500/15 via-background to-background p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Staff Mode
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Khu vận hành dành cho staff
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tại đây bạn có thể kiểm soát danh mục, thương hiệu, sản phẩm và tồn kho mà không bị lẫn với khu chăm sóc khách hàng hay phân tích báo cáo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/manager/products">
                  Vào sản phẩm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/manager/inventory">Xem kho hàng</Link>
              </Button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading || !dashboard ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Tổng doanh thu"
                value={dashboard.kpi.totalRevenue.toLocaleString()}
                change={dashboard.kpi.revenueChange}
                icon={DollarSign}
                prefix="$"
              />
              <KpiCard
                title="Tổng đơn hàng"
                value={dashboard.kpi.totalOrders.toLocaleString()}
                change={dashboard.kpi.ordersChange}
                icon={ShoppingCart}
              />
              <KpiCard
                title="Tổng khách hàng"
                value={dashboard.kpi.totalCustomers.toLocaleString()}
                change={dashboard.kpi.customersChange}
                icon={Users}
              />
              <KpiCard
                title="Giá trị đơn trung bình"
                value={dashboard.kpi.avgOrderValue.toFixed(2)}
                change={dashboard.kpi.avgOrderChange}
                icon={TrendingUp}
                prefix="$"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SalesChart data={dashboard.salesChartData} />
              </div>
              <div>
                <CategoryChart data={dashboard.categoryDistribution} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentOrders orders={dashboard.recentOrders} />
              </div>
              <div>
                <LowStockAlert items={dashboard.lowStockItems} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
