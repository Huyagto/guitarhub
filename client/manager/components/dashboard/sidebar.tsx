"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ShoppingCart,
  Users,
  Warehouse,
  Ticket,
  BarChart3,
  Settings,
  Music2,
} from "lucide-react"
import { getStoredManagerUser } from "@/lib/auth"

const navigation = [
  { name: "Tổng quan", href: "/manager", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/manager/products", icon: Package },
  { name: "Danh mục", href: "/manager/categories", icon: FolderTree },
  { name: "Thương hiệu", href: "/manager/brands", icon: Tags },
  { name: "Đơn hàng", href: "/manager/orders", icon: ShoppingCart },
  { name: "Khách hàng", href: "/manager/customers", icon: Users },
  { name: "Kho hàng", href: "/manager/inventory", icon: Warehouse },
  { name: "Voucher", href: "/manager/vouchers", icon: Ticket },
  { name: "Báo cáo", href: "/manager/reports", icon: BarChart3 },
  { name: "Cài đặt", href: "/manager/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("Quản lý")

  useEffect(() => {
    const user = getStoredManagerUser()
    if (user?.fullName) {
      setUserName(user.fullName)
    }
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Music2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Guitar Store</span>
          <span className="text-xs text-muted-foreground">Cổng quản trị</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/manager" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-foreground">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">{userName}</span>
            <span className="text-xs text-muted-foreground">Quản lý cửa hàng</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
