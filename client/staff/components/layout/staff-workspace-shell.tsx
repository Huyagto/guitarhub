"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BellRing, Clock, LogOut } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { StaffWorkspaceNav } from "@/components/layout/staff-workspace-nav"
import { clearStaffSession, getStoredStaffUser } from "@/lib/auth"
import { getStaffSocket } from "@/lib/socket"
import type { StaffOrder } from "@/lib/order-types"

const STAFF_ORDERS_CACHE_KEY = "staff_orders_cache"

function readCachedOrders() {
  if (typeof window === "undefined") return [] as StaffOrder[]

  const cachedOrders = window.sessionStorage.getItem(STAFF_ORDERS_CACHE_KEY)
  if (!cachedOrders) return []

  try {
    return JSON.parse(cachedOrders) as StaffOrder[]
  } catch {
    return []
  }
}

function writeCachedOrders(orders: StaffOrder[]) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STAFF_ORDERS_CACHE_KEY, JSON.stringify(orders))
}

export function StaffWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [staffName, setStaffName] = useState("Nhân viên")
  const [onlineOrdersCount, setOnlineOrdersCount] = useState(0)
  const [liveNotice, setLiveNotice] = useState("")

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const user = getStoredStaffUser()
    if (user?.fullName) {
      setStaffName(user.fullName)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncWaitingCount = () => {
      const parsed = readCachedOrders()
      setOnlineOrdersCount(parsed.filter((order) => order.status === "pending_confirmation").length)
    }

    syncWaitingCount()
    window.addEventListener("focus", syncWaitingCount)
    return () => window.removeEventListener("focus", syncWaitingCount)
  }, [pathname])

  useEffect(() => {
    if (!liveNotice) return

    const timer = window.setTimeout(() => {
      setLiveNotice("")
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [liveNotice])

  useEffect(() => {
    const socket = getStaffSocket()
    if (!socket) {
      return
    }

    const syncWaitingCountFromOrders = (orders: StaffOrder[]) => {
      setOnlineOrdersCount(
        orders.filter((order) => order.status === "pending_confirmation").length
      )
    }

    const handleOrderCreated = (order: StaffOrder) => {
      const currentOrders = readCachedOrders()
      const nextOrders = [order, ...currentOrders.filter((item) => item.id !== order.id)]
      writeCachedOrders(nextOrders)
      syncWaitingCountFromOrders(nextOrders)
      setLiveNotice(`Đơn online mới ${order.orderNumber} đang chờ staff xác nhận.`)
    }

    const handleOrderUpdated = (order: StaffOrder) => {
      const currentOrders = readCachedOrders()
      const nextOrders = currentOrders.map((item) =>
        item.id === order.id ? order : item
      )

      if (!currentOrders.some((item) => item.id === order.id)) {
        nextOrders.unshift(order)
      }

      writeCachedOrders(nextOrders)
      syncWaitingCountFromOrders(nextOrders)

      if (order.status === "pending_confirmation") {
        setLiveNotice(`Đơn ${order.orderNumber} vẫn đang chờ staff xác nhận.`)
        return
      }

      setLiveNotice("")
    }

    socket.on("order:created", handleOrderCreated)
    socket.on("order:updated", handleOrderUpdated)

    return () => {
      socket.off("order:created", handleOrderCreated)
      socket.off("order:updated", handleOrderUpdated)
    }
  }, [])

  const activeSection = useMemo(
    () => (pathname?.startsWith("/orders") ? "orders" : "pos"),
    [pathname]
  )

  const handleLogout = () => {
    clearStaffSession()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col bg-background">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-red-900 text-sm font-black text-white shadow-sm">
              GH
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">GuitarHub Staff</h1>
              <p className="text-xs text-muted-foreground">
                {activeSection === "orders" ? "Xử lý đơn hàng online" : "Khu vực bán hàng tại quầy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StaffWorkspaceNav active={activeSection} ordersBadgeCount={onlineOrdersCount} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {currentTime ? (
                <>
                  <span>{currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-xs">{currentTime.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                </>
              ) : null}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {staffName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {liveNotice ? (
          <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              {liveNotice}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </AuthGuard>
  )
}
