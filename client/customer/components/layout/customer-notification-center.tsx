"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Bell, BellRing, Package2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCustomerSocket } from "@/lib/socket"
import { getStoredUser } from "@/lib/auth"
import {
  CUSTOMER_NOTIFICATIONS_CHANGED_EVENT,
  getCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
  pushCustomerNotification,
  type CustomerNotification,
} from "@/lib/customer-notifications"

interface OrderRealtimePayload {
  orderNumber: string
  status: string
  customerId?: string
}

const statusLabels: Record<string, string> = {
  awaiting_payment: "Chờ thanh toán",
  pending_confirmation: "Chờ staff xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready_to_ship: "Sẵn sàng giao",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

function formatRelativeTime(value: string) {
  const time = new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.round((Date.now() - time) / 60000))

  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  if (diffMinutes < 24 * 60) return `${Math.round(diffMinutes / 60)} giờ trước`
  return `${Math.round(diffMinutes / (24 * 60))} ngày trước`
}

export function CustomerNotificationCenter() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const syncNotifications = () => {
      const user = getStoredUser()
      setUserId(user?.id || null)
      setNotifications(getCustomerNotifications(user?.id || null))
    }

    syncNotifications()
    window.addEventListener(CUSTOMER_NOTIFICATIONS_CHANGED_EVENT, syncNotifications)

    return () => {
      window.removeEventListener(CUSTOMER_NOTIFICATIONS_CHANGED_EVENT, syncNotifications)
    }
  }, [])

  useEffect(() => {
    const user = getStoredUser()
    if (!user?.id) return

    const socket = getCustomerSocket()
    if (!socket) return

    const handleOrderCreated = (payload: OrderRealtimePayload) => {
      const notification: CustomerNotification = {
        id: `order_created:${payload.orderNumber}:${payload.status}`,
        type: "order_created",
        title: "Đơn hàng đã được ghi nhận",
        message: `Đơn ${payload.orderNumber} đã chuyển sang staff để xử lý.`,
        orderNumber: payload.orderNumber,
        status: payload.status,
        createdAt: new Date().toISOString(),
        read: false,
        href: "/profile/orders",
      }

      pushCustomerNotification(notification, user.id)
      setNotifications(getCustomerNotifications(user.id))
    }

    const handleOrderUpdated = (payload: OrderRealtimePayload) => {
      const notification: CustomerNotification = {
        id: `order_updated:${payload.orderNumber}:${payload.status}`,
        type: "order_updated",
        title: "Đơn hàng vừa được cập nhật",
        message: `Đơn ${payload.orderNumber} hiện ở trạng thái: ${statusLabels[payload.status] || payload.status}.`,
        orderNumber: payload.orderNumber,
        status: payload.status,
        createdAt: new Date().toISOString(),
        read: false,
        href: "/profile/orders",
      }

      pushCustomerNotification(notification, user.id)
      setNotifications(getCustomerNotifications(user.id))
    }

    socket.on("order:created", handleOrderCreated)
    socket.on("order:updated", handleOrderUpdated)

    return () => {
      socket.off("order:created", handleOrderCreated)
      socket.off("order:updated", handleOrderUpdated)
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  if (!userId) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full border border-transparent hover:border-border">
          {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
          <span className="sr-only">Thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0">Thông báo</DropdownMenuLabel>
          {notifications.length ? (
            <button
              type="button"
              className="text-xs font-medium text-accent hover:underline"
              onClick={() => {
                markAllCustomerNotificationsRead(userId)
                setNotifications(getCustomerNotifications(userId))
              }}
            >
              Đánh dấu đã đọc
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {notifications.length ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              asChild
              className="cursor-pointer items-start gap-3 p-0 focus:bg-muted"
            >
              <Link
                href={notification.href || "/profile"}
                className="flex w-full items-start gap-3 px-3 py-3"
                onClick={() => {
                  markCustomerNotificationRead(notification.id, userId)
                  setNotifications(getCustomerNotifications(userId))
                }}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Package2 className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="line-clamp-1 text-sm font-semibold text-foreground">
                      {notification.title}
                    </span>
                    {!notification.read ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground/80">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Chưa có thông báo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cập nhật đơn hàng và trạng thái giao hàng sẽ hiện ở đây.
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
