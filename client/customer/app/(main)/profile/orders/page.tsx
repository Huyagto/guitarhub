"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CreditCard,
  Loader2,
  Package,
  PackageSearch,
  RefreshCw,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { getCustomerOrders, type CustomerOrder } from "@/lib/customer-auth-api"
import { formatPrice } from "@/lib/format"

const paymentMethodLabels: Record<CustomerOrder["paymentMethod"], string> = {
  cod: "Thanh toán khi nhận hàng",
  momo: "MoMo",
  vnpay: "VNPay",
  zalopay: "ZaloPay",
}

const paymentStatusLabels: Record<CustomerOrder["paymentStatus"], string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
}

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  )

  const activeOrders = useMemo(
    () => orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
    [orders]
  )

  const loadOrders = async () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      setError("Bạn cần đăng nhập để xem lịch sử đơn hàng.")
      setOrders([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await getCustomerOrders(accessToken)
      setOrders(response.metadata)
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Không thể tải lịch sử đơn hàng"))
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Lịch sử đơn hàng</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Theo dõi trạng thái đơn hàng, sản phẩm đã mua và tổng chi tiêu của bạn.
          </p>
        </div>

        <Button variant="outline" onClick={() => void loadOrders()} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Tổng số đơn</CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Đơn đang xử lý</CardDescription>
            <CardTitle className="text-3xl">{activeOrders}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Tổng chi tiêu</CardDescription>
            <CardTitle className="text-3xl">{formatPrice(totalSpent)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 && !error ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={PackageSearch}
              title="Bạn chưa có đơn hàng nào"
              description="Khi hoàn tất mua sắm, đơn hàng sẽ xuất hiện tại đây để bạn theo dõi trạng thái."
              action={
                <Button asChild>
                  <Link href="/shop">
                    Mua sắm ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const shippingAddress = [
              order.shippingInfo.detailAddress,
              order.shippingInfo.ward,
              order.shippingInfo.district,
              order.shippingInfo.province,
            ]
              .filter(Boolean)
              .join(", ")

            return (
              <Card key={order.id} className="overflow-hidden gap-0">
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="text-lg">Đơn hàng #{order.orderNumber}</CardTitle>
                      <CardDescription className="mt-2">
                        Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                        {paymentStatusLabels[order.paymentStatus]}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-muted/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        Sản phẩm
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{order.items}</p>
                      <p className="mt-1 text-sm text-muted-foreground">món trong đơn hàng này</p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Thanh toán
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {paymentMethodLabels[order.paymentMethod]}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatPrice(order.total)}</p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Truck className="h-4 w-4 text-primary" />
                        Giao hàng
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {order.shippingInfo.recipientName || order.customer}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {shippingAddress || "Chưa có địa chỉ giao hàng"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{item.productName}</p>
                            <p className="mt-1 text-sm text-muted-foreground">SKU: {item.productSku || "N/A"}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatPrice(item.unitPrice)} x {item.quantity}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4 text-sm sm:items-end">
                    <div className="flex w-full items-center justify-between sm:max-w-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex w-full items-center justify-between sm:max-w-sm">
                      <span className="text-muted-foreground">Phí giao hàng</span>
                      <span className="font-medium text-foreground">{formatPrice(order.shippingFee)}</span>
                    </div>
                    <div className="flex w-full items-center justify-between border-t border-border pt-2 sm:max-w-sm">
                      <span className="font-medium text-foreground">Tổng thanh toán</span>
                      <span className="text-base font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {order.note ? (
                    <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                      Ghi chú: {order.note}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
