"use client"

import { useEffect, useMemo, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Order, OrderStatus } from "@/lib/manager-types"
import { CheckCircle, Eye, Loader2, MoreHorizontal, PackageCheck, ShoppingCart, Truck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { getManagerOrders, updateManagerOrderStatus } from "@/lib/manager-data-api"

const statusStyles: Record<OrderStatus, string> = {
  awaiting_payment: "bg-muted text-muted-foreground border-border",
  pending_confirmation: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  confirmed: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  preparing: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  ready_to_ship: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  shipping: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

const paymentStyles = {
  paid: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
}

const statusLabels: Record<OrderStatus, string> = {
  awaiting_payment: "Chờ thanh toán",
  pending_confirmation: "Chờ staff xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready_to_ship: "Sẵn sàng giao",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const paymentLabels = {
  paid: "Đã thanh toán",
  pending: "Chưa thanh toán",
  failed: "Thanh toán lỗi",
  refunded: "Đã hoàn tiền",
}

const nextActionByStatus: Partial<Record<OrderStatus, { label: string; status: OrderStatus; icon: typeof CheckCircle }>> = {
  pending_confirmation: { label: "Xác nhận đơn", status: "confirmed", icon: CheckCircle },
  confirmed: { label: "Chuyển sang chuẩn bị", status: "preparing", icon: PackageCheck },
  preparing: { label: "Sẵn sàng giao", status: "ready_to_ship", icon: PackageCheck },
  ready_to_ship: { label: "Bắt đầu giao", status: "shipping", icon: Truck },
  shipping: { label: "Đánh dấu đã giao", status: "delivered", icon: CheckCircle },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

function formatAddress(order: Order) {
  const shipping = order.shippingInfo
  if (!shipping) return "Chưa có địa chỉ"

  return shipping.displayName || [shipping.detailAddress, shipping.ward, shipping.district, shipping.province].filter(Boolean).join(", ")
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getManagerOrders()
        setOrders(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải đơn hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  const filteredOrders = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter]
  )

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await updateManagerOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? response.metadata : order)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.metadata)
      }
      setError("")
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Không thể cập nhật trạng thái đơn hàng"))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const columns = [
    {
      key: "orderNumber" as const,
      header: "Đơn hàng",
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
        </div>
      ),
    },
    {
      key: "customer" as const,
      header: "Khách hàng",
      render: (order: Order) => (
        <div>
          <p className="font-medium text-foreground">{order.customer}</p>
          <p className="text-sm text-muted-foreground">{order.email}</p>
        </div>
      ),
    },
    {
      key: "items" as const,
      header: "Số lượng",
      render: (order: Order) => <span className="text-muted-foreground">{order.items} sản phẩm</span>,
    },
    {
      key: "source" as const,
      header: "Kênh bán",
      render: (order: Order) => (
        <Badge variant="outline">
          {order.source === "store" ? "Tại cửa hàng" : "Online"}
        </Badge>
      ),
    },
    {
      key: "total" as const,
      header: "Tổng tiền",
      render: (order: Order) => <span className="font-medium">{formatCurrency(order.total)}</span>,
    },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
          {statusLabels[order.status]}
        </Badge>
      ),
    },
    {
      key: "paymentStatus" as const,
      header: "Thanh toán",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", paymentStyles[order.paymentStatus])}>
          {paymentLabels[order.paymentStatus]}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Đơn hàng" description="Theo dõi luồng xử lý đơn giữa khách hàng, staff và giao hàng" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả đơn hàng</h2>
                <p className="text-sm text-muted-foreground">{filteredOrders.length} đơn hàng</p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="awaiting_payment">Chờ thanh toán</SelectItem>
                  <SelectItem value="pending_confirmation">Chờ staff xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                  <SelectItem value="ready_to_ship">Sẵn sàng giao</SelectItem>
                  <SelectItem value="shipping">Đang giao</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={filteredOrders}
                columns={columns}
                searchKey="orderNumber"
                searchPlaceholder="Tìm theo mã đơn..."
                actions={(order) => {
                  const nextAction = nextActionByStatus[order.status]
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={updatingOrderId === order.id}>
                          {updatingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {(nextAction || (order.status !== "cancelled" && order.status !== "delivered" && order.status !== "awaiting_payment")) ? <DropdownMenuSeparator /> : null}
                        {nextAction ? (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, nextAction.status)}>
                            <nextAction.icon className="mr-2 h-4 w-4" />
                            {nextAction.label}
                          </DropdownMenuItem>
                        ) : null}
                        {order.status !== "cancelled" && order.status !== "delivered" && order.status !== "awaiting_payment" ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, "cancelled")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Hủy đơn hàng
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                  {selectedOrder.phone ? <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p> : null}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái giao vận</p>
                  <Badge variant="outline" className={cn("mt-1", statusStyles[selectedOrder.status])}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                  <p className="mt-3 text-sm text-muted-foreground">Thanh toán</p>
                  <Badge variant="outline" className={cn("mt-1", paymentStyles[selectedOrder.paymentStatus])}>
                    {paymentLabels[selectedOrder.paymentStatus]}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đặt</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                  <p className="font-medium">{formatAddress(selectedOrder)}</p>
                </div>
              </div>

              {selectedOrder.lineItems?.length ? (
                <div className="rounded-xl border border-border">
                  <div className="border-b border-border px-4 py-3 text-sm font-medium">Sản phẩm</div>
                  <div className="divide-y divide-border">
                    {selectedOrder.lineItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">{item.productSku} • x{item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
