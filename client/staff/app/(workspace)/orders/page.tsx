"use client"

import { useEffect, useMemo, useState } from "react"
import { BellRing, CheckCircle2, Clock3, Loader2, PackageCheck, Printer, Truck, XCircle } from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getStaffOrders, updateStaffOrderStatus } from "@/lib/order-api"
import { getStaffSocket } from "@/lib/socket"
import { getStoredStaffUser } from "@/lib/auth"
import { printOrderReceipt } from "@/lib/staff-receipt"
import type { StaffOrder, StaffOrderStatus } from "@/lib/order-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

const statusStyles: Record<StaffOrderStatus, string> = {
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

const statusLabels: Record<StaffOrderStatus, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready_to_ship: "Sẵn sàng giao",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

const paymentLabels = {
  paid: "Đã thanh toán",
  pending: "Chờ thu tiền",
  failed: "Lỗi thanh toán",
  refunded: "Đã hoàn tiền",
}

const nextActionByStatus: Partial<Record<StaffOrderStatus, { label: string; status: StaffOrderStatus }>> = {
  pending_confirmation: { label: "Xác nhận đơn", status: "confirmed" },
  confirmed: { label: "Bắt đầu chuẩn bị", status: "preparing" },
  preparing: { label: "Chuyển sang sẵn sàng giao", status: "ready_to_ship" },
  ready_to_ship: { label: "Bàn giao cho đơn vị vận chuyển", status: "shipping" },
  shipping: { label: "Đánh dấu đã giao", status: "delivered" },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

function formatAddress(order: StaffOrder) {
  const shipping = order.shippingInfo
  if (!shipping) return "Chưa có địa chỉ"
  return shipping.displayName || [shipping.detailAddress, shipping.ward, shipping.district, shipping.province].filter(Boolean).join(", ")
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<StaffOrder[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [liveMessage, setLiveMessage] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      if (typeof window !== "undefined") {
        const cachedOrders = window.sessionStorage.getItem(getStaffOrdersCacheKey())
        if (cachedOrders) {
          try {
            const parsed = JSON.parse(cachedOrders) as StaffOrder[]
            setOrders(parsed.filter(isOrderForCurrentBranch))
            setIsLoading(false)
          } catch {
            window.sessionStorage.removeItem(getStaffOrdersCacheKey())
          }
        }
      }

      try {
        const response = await getStaffOrders()
        setOrders(response.metadata)
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(getStaffOrdersCacheKey(), JSON.stringify(response.metadata))
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải danh sách đơn hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  useEffect(() => {
    const socket = getStaffSocket()
    if (!socket) {
      return
    }

    const handleOrderCreated = (order: StaffOrder) => {
      if (!isOrderForCurrentBranch(order)) return
      setOrders((prev) => {
        const nextOrders = [order, ...prev.filter((item) => item.id !== order.id)]
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(getStaffOrdersCacheKey(), JSON.stringify(nextOrders))
        }
        return nextOrders
      })
      if (order.status === "pending_confirmation") {
        setLiveMessage(`Đơn mới ${order.orderNumber} vừa được gửi sang staff.`)
      }
    }

    const handleOrderUpdated = (order: StaffOrder) => {
      if (!isOrderForCurrentBranch(order)) return
      setOrders((prev) => {
        const nextOrders = prev.map((item) => (item.id === order.id ? order : item))
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(getStaffOrdersCacheKey(), JSON.stringify(nextOrders))
        }
        return nextOrders
      })
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(order)
      }
      setLiveMessage(`Đơn ${order.orderNumber} vừa được cập nhật trạng thái.`)
    }

    socket.on("order:created", handleOrderCreated)
    socket.on("order:updated", handleOrderUpdated)

    return () => {
      socket.off("order:created", handleOrderCreated)
      socket.off("order:updated", handleOrderUpdated)
    }
  }, [selectedOrder])

  const filteredOrders = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)),
    [orders, statusFilter]
  )

  const handleStatusUpdate = async (orderId: string, newStatus: StaffOrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await updateStaffOrderStatus(orderId, newStatus)
      setOrders((prev) => {
        const nextOrders = prev.map((order) => (order.id === orderId ? response.metadata : order))
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(getStaffOrdersCacheKey(), JSON.stringify(nextOrders))
        }
        return nextOrders
      })
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.metadata)
      }
      setError("")
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Không thể cập nhật đơn hàng"))
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const summary = useMemo(
    () => ({
      waiting: orders.filter((order) => order.status === "pending_confirmation").length,
      preparing: orders.filter((order) => order.status === "preparing" || order.status === "confirmed").length,
      shipping: orders.filter((order) => order.status === "ready_to_ship" || order.status === "shipping").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
    }),
    [orders]
  )

  return (
    <main className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {liveMessage ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            <BellRing className="h-4 w-4" />
            {liveMessage}
          </div>
        ) : null}

        {error ? <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Chờ xác nhận</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-3xl font-semibold">{summary.waiting}</span>
              <Clock3 className="h-5 w-5 text-amber-600" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Đang chuẩn bị</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-3xl font-semibold">{summary.preparing}</span>
              <PackageCheck className="h-5 w-5 text-violet-600" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sắp giao / đang giao</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-3xl font-semibold">{summary.shipping}</span>
              <Truck className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Đã giao</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-3xl font-semibold">{summary.delivered}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <p className="text-sm text-muted-foreground">{filteredOrders.length} đơn trong bộ lọc hiện tại</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending_confirmation">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                <SelectItem value="ready_to_ship">Sẵn sàng giao</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đơn hàng</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead>Vận chuyển</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead className="text-right">Tác vụ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const nextAction = nextActionByStatus[order.status]
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <button className="text-left" onClick={() => setSelectedOrder(order)}>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                            </button>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.phone || order.email}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentStyles[order.paymentStatus]}>
                              {paymentLabels[order.paymentStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                Chi tiết
                              </Button>
                              {nextAction ? (
                                <Button size="sm" disabled={updatingOrderId === order.id} onClick={() => handleStatusUpdate(order.id, nextAction.status)}>
                                  {updatingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : nextAction.label}
                                </Button>
                              ) : null}
                              {order.status !== "cancelled" && order.status !== "delivered" ? (
                                <Button variant="outline" size="sm" className="text-destructive" disabled={updatingOrderId === order.id} onClick={() => handleStatusUpdate(order.id, "cancelled")}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Người nhận</p>
                  <p className="font-medium">{selectedOrder.shippingInfo?.recipientName || selectedOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.phone || selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                  <p className="font-medium">{formatAddress(selectedOrder)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant="outline" className={`mt-1 ${statusStyles[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <Badge variant="outline" className={`mt-1 ${paymentStyles[selectedOrder.paymentStatus]}`}>
                    {paymentLabels[selectedOrder.paymentStatus]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức</p>
                  <p className="font-medium uppercase">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

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

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedOrder && printOrderReceipt(selectedOrder, getStoredStaffUser())}
            >
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
