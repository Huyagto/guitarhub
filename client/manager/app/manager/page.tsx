import { Topbar } from "@/components/dashboard/topbar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { kpiData } from "@/lib/mock-data"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen">
      <Topbar title="Tổng quan" description="Chào mừng bạn quay lại" />
      
      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Tổng doanh thu"
            value={kpiData.totalRevenue.toLocaleString()}
            change={kpiData.revenueChange}
            icon={DollarSign}
            prefix="$"
          />
          <KpiCard
            title="Tổng đơn hàng"
            value={kpiData.totalOrders.toLocaleString()}
            change={kpiData.ordersChange}
            icon={ShoppingCart}
          />
          <KpiCard
            title="Tổng khách hàng"
            value={kpiData.totalCustomers.toLocaleString()}
            change={kpiData.customersChange}
            icon={Users}
          />
          <KpiCard
            title="Giá trị đơn trung bình"
            value={kpiData.avgOrderValue.toFixed(2)}
            change={kpiData.avgOrderChange}
            icon={TrendingUp}
            prefix="$"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <CategoryChart />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <div>
            <LowStockAlert />
          </div>
        </div>
      </main>
    </div>
  )
}
