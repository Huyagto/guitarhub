"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCustomerSocket } from "@/lib/socket"

type LiveOrderStatus =
  | "awaiting_payment"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "shipping"
  | "delivered"
  | "cancelled"

const statusLabels: Record<LiveOrderStatus, string> = {
  awaiting_payment: "Chờ thanh toán",
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready_to_ship: "Sẵn sàng giao",
  shipping: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const statusColors: Record<LiveOrderStatus, string> = {
  awaiting_payment: "text-muted-foreground bg-muted",
  pending_confirmation: "text-amber-700 bg-amber-500/10",
  confirmed: "text-sky-700 bg-sky-500/10",
  preparing: "text-violet-700 bg-violet-500/10",
  ready_to_ship: "text-cyan-700 bg-cyan-500/10",
  shipping: "text-primary bg-primary/10",
  delivered: "text-emerald-700 bg-emerald-500/10",
  cancelled: "text-destructive bg-destructive/10",
}

const paymentMethodLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  momo: "Ví MoMo",
  vnpay: "VNPay",
  zalopay: "ZaloPay",
}

const ORDER_STEPS: { key: LiveOrderStatus; label: string; icon: React.ElementType }[] = [
  { key: "pending_confirmation", label: "Đặt hàng", icon: ClipboardList },
  { key: "confirmed", label: "Xác nhận", icon: CheckCircle2 },
  { key: "preparing", label: "Chuẩn bị", icon: Package },
  { key: "shipping", label: "Vận chuyển", icon: Truck },
  { key: "delivered", label: "Đã giao", icon: CheckCircle2 },
]

const stepOrder: LiveOrderStatus[] = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "ready_to_ship",
  "shipping",
  "delivered",
]

interface RealtimeOrderPayload {
  orderNumber: string
  status: LiveOrderStatus
  paymentStatus: string
}

interface CheckoutSuccessContentProps {
  orderCode: string
  paymentMethod: string
  status: string
}

export function CheckoutSuccessContent({
  orderCode,
  paymentMethod,
  status,
}: CheckoutSuccessContentProps) {
  const isSuccess = status === "success"

  const [liveStatus, setLiveStatus] = useState<LiveOrderStatus>(
    isSuccess ? "pending_confirmation" : "cancelled"
  )
  const [liveMessage, setLiveMessage] = useState("")
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  useEffect(() => {
    const socket = getCustomerSocket()
    if (!socket || !orderCode) return

    const handleConnect = () => setIsRealtimeConnected(true)
    const handleDisconnect = () => setIsRealtimeConnected(false)
    const handleOrderCreated = (payload: RealtimeOrderPayload) => {
      if (payload.orderNumber !== orderCode) return
      setLiveStatus(payload.status)
      setLiveMessage("Đơn hàng đã được chuyển sang nhân viên để xử lý.")
    }
    const handleOrderUpdated = (payload: RealtimeOrderPayload) => {
      if (payload.orderNumber !== orderCode) return
      setLiveStatus(payload.status)
      setLiveMessage(`Trạng thái mới: ${statusLabels[payload.status]}.`)
    }

    if (socket.connected) setIsRealtimeConnected(true)

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("order:created", handleOrderCreated)
    socket.on("order:updated", handleOrderUpdated)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("order:created", handleOrderCreated)
      socket.off("order:updated", handleOrderUpdated)
    }
  }, [orderCode])

  const currentStepIndex = useMemo(
    () => stepOrder.indexOf(liveStatus),
    [liveStatus]
  )

  return (
    <div className="py-12">
      <div className="mx-auto max-w-xl px-4">

        {/* Icon + tiêu đề */}
        <div className="text-center">
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
              isSuccess ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-600" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" strokeWidth={1.5} />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
            {isSuccess ? "Đặt hàng thành công!" : "Thanh toán chưa hoàn tất"}
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {isSuccess
              ? "Cảm ơn bạn đã tin tưởng GuitarHub. Đơn hàng đã được ghi nhận và nhân viên sẽ xử lý ngay."
              : "Giao dịch chưa hoàn tất hoặc đã bị hủy. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
          </p>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thông tin đơn hàng
            </p>
          </div>

          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                Mã đơn hàng
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                {orderCode || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Phương thức thanh toán
              </div>
              <span className="text-sm font-medium text-foreground">
                {paymentMethodLabels[paymentMethod] ?? paymentMethod.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                Dự kiến giao hàng
              </div>
              <span className="text-sm font-medium text-foreground">3 – 5 ngày làm việc</span>
            </div>

            {isSuccess ? (
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRealtimeConnected ? "bg-emerald-500" : "bg-muted-foreground"
                    }`}
                  />
                  Trạng thái đơn hàng
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[liveStatus]}`}
                >
                  {statusLabels[liveStatus]}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Timeline tiến trình — chỉ hiện khi thành công */}
        {isSuccess && liveStatus !== "cancelled" ? (
          <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-5">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tiến trình đơn hàng
            </p>
            <div className="flex items-start justify-between gap-1">
              {ORDER_STEPS.map((step, index) => {
                const stepIdx = stepOrder.indexOf(step.key)
                const isDone = currentStepIndex >= stepIdx && currentStepIndex !== -1
                const isCurrent =
                  liveStatus === step.key ||
                  (step.key === "shipping" && liveStatus === "ready_to_ship")
                const Icon = step.icon

                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full items-center">
                      {index > 0 ? (
                        <div
                          className={`h-0.5 flex-1 ${
                            isDone ? "bg-emerald-500" : "bg-border"
                          }`}
                        />
                      ) : (
                        <div className="flex-1" />
                      )}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : isDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {index < ORDER_STEPS.length - 1 ? (
                        <div
                          className={`h-0.5 flex-1 ${
                            currentStepIndex > stepIdx ? "bg-emerald-500" : "bg-border"
                          }`}
                        />
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                    <span
                      className={`text-center text-xs ${
                        isCurrent
                          ? "font-semibold text-primary"
                          : isDone
                            ? "text-emerald-700"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {liveMessage ? (
              <p className="mt-4 rounded-lg bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
                {liveMessage}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                Trang này tự động cập nhật khi nhân viên thay đổi trạng thái đơn hàng.
              </p>
            )}
          </div>
        ) : null}

        {/* Nút hành động */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isSuccess ? (
            <Button asChild>
              <Link href="/profile/orders">
                <Package className="mr-2 h-4 w-4" />
                Xem đơn hàng của tôi
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/checkout">
                <RotateCcw className="mr-2 h-4 w-4" />
                Thử lại thanh toán
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/shop">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}
