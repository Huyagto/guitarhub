"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BellRing, Clock, LogOut, MapPin } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { StaffWorkspaceNav } from "@/components/layout/staff-workspace-nav"
import { clearStaffSession, getStoredStaffUser } from "@/lib/auth"
import { getStaffOrders } from "@/lib/order-api"
import { disconnectStaffSocket, getStaffSocket } from "@/lib/socket"
import type { StaffOrder } from "@/lib/order-types"

const STAFF_ORDERS_CACHE_KEY = "staff_orders_cache"

function getStaffOrdersCacheKey() {
  const branchId = getStoredStaffUser()?.branchId
  return branchId ? `${STAFF_ORDERS_CACHE_KEY}:${branchId}` : STAFF_ORDERS_CACHE_KEY
}

function isOrderForCurrentBranch(order: StaffOrder) {
  const branchId = getStoredStaffUser()?.branchId
  if (!branchId) return false
  return Boolean(order.customerId) && order.branch?.id === String(branchId)
}

function readCachedOrders() {
  if (typeof window === "undefined") return [] as StaffOrder[]

  const cachedOrders = window.sessionStorage.getItem(getStaffOrdersCacheKey())
  if (!cachedOrders) return []

  try {
    return (JSON.parse(cachedOrders) as StaffOrder[]).filter(isOrderForCurrentBranch)
  } catch {
    return []
  }
}

function writeCachedOrders(orders: StaffOrder[]) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(
    getStaffOrdersCacheKey(),
    JSON.stringify(orders.filter(isOrderForCurrentBranch))
  )
}

export function StaffWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [staffName, setStaffName] = useState("Nhân viên")
  const [branchLabel, setBranchLabel] = useState("")
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
    if (user?.branch?.code) {
      setBranchLabel(`${user.branch.code} - ${user.branch.name}`)
    } else {
      setBranchLabel("Chưa gán chi nhánh")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncWaitingCount = async () => {
      const parsed = readCachedOrders()
      setOnlineOrdersCount(parsed.filter((order) => order.status === "pending_confirmation").length)

      try {
        const response = await getStaffOrders()
        writeCachedOrders(response.metadata)
        setOnlineOrdersCount(
          response.metadata.filter((order) => order.status === "pending_confirmation").length
        )
      } catch {
        // Keep the cached count when the staff API is temporarily unavailable.
      }
    }

    void syncWaitingCount()
    const handleFocus = () => void syncWaitingCount()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
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
      if (!isOrderForCurrentBranch(order)) return
      const currentOrders = readCachedOrders()
      const nextOrders = [order, ...currentOrders.filter((item) => item.id !== order.id)]
      writeCachedOrders(nextOrders)
      syncWaitingCountFromOrders(nextOrders)
      if (order.status === "pending_confirmation") {
        setLiveNotice(`Đơn online mới ${order.orderNumber} đang chờ staff xác nhận.`)
      }
    }

    const handleOrderUpdated = (order: StaffOrder) => {
      if (!isOrderForCurrentBranch(order)) return
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

  const activeSection = useMemo(() => {
    if (pathname?.startsWith("/orders")) return "orders"
    if (pathname?.startsWith("/history")) return "history"
    if (pathname?.startsWith("/inventory")) return "inventory"
    if (pathname?.startsWith("/shift")) return "shift"
    return "pos"
  }, [pathname])

  const sectionLabel = {
    pos: "Khu vực bán hàng tại quầy",
    orders: "Xử lý đơn hàng online",
    history: "Lịch sử đơn của chi nhánh",
    inventory: "Tồn kho hiện có tại cửa hàng",
    shift: "Tổng kết và đóng ca",
  }[activeSection]

  const handleLogout = () => {
    disconnectStaffSocket()
    clearStaffSession()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col bg-background">
        <header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-red-900 text-sm font-black text-white shadow-sm">
              GH
            </div>
            <div className="hidden min-w-0 sm:block">
              <h1 className="text-base font-semibold text-foreground">GuitarHub Staff</h1>
              <p className="max-w-40 truncate text-xs text-muted-foreground">
                {sectionLabel}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="hidden max-w-44 items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-medium text-foreground lg:flex">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{branchLabel}</span>
            </div>
            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <StaffWorkspaceNav active={activeSection} ordersBadgeCount={onlineOrdersCount} />
            </div>
            <div className="hidden items-center gap-2 whitespace-nowrap text-sm text-muted-foreground md:flex">
              <Clock className="h-4 w-4" />
              {currentTime ? (
                <>
                  <span>{currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-xs">{currentTime.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                </>
              ) : null}
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Đăng xuất</span>
            </Button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
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
