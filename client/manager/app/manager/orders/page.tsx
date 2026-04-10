"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/manager-types"
import { CheckCircle, Eye, Loader2, MoreHorizontal, ShoppingCart, Truck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { getManagerOrders, updateManagerOrderStatus } from "@/lib/manager-data-api"

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

const paymentStyles = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  refunded: "bg-muted text-muted-foreground border-muted",
}

const getOrderStatusLabel = (status: Order["status"]) =>
  status === "pending" ? "Chờ xử lý" :
  status === "processing" ? "Đang xử lý" :
  status === "shipped" ? "Đang giao" :
  status === "delivered" ? "Đã giao" : "Đã hủy"

const getPaymentStatusLabel = (status: Order["paymentStatus"]) =>
  status === "paid" ? "Đã thanh toán" : status === "pending" ? "Chờ thanh toán" : "Đã hoàn tiền"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
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

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter)

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await updateManagerOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? response.metadata : order)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.metadata)
      }
      setError("")
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Không thể cập nhật trạng thái đơn hàng"))
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
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ),
    },
    { key: "customer" as const, header: "Khách hàng", render: (order: Order) => <div><p className="font-medium text-foreground">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div> },
    { key: "items" as const, header: "Số lượng", render: (order: Order) => <span className="text-muted-foreground">{order.items} sản phẩm</span> },
    { key: "total" as const, header: "Tổng tiền", render: (order: Order) => <span className="font-medium">${order.total.toLocaleString()}</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (order: Order) => <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>{getOrderStatusLabel(order.status)}</Badge>,
    },
    {
      key: "paymentStatus" as const,
      header: "Thanh toán",
      render: (order: Order) => <Badge variant="outline" className={cn("capitalize", paymentStyles[order.paymentStatus])}>{getPaymentStatusLabel(order.paymentStatus)}</Badge>,
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Đơn hàng" description="Quản lý đơn hàng của khách hàng" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả đơn hàng</h2>
                <p className="text-sm text-muted-foreground">{filteredOrders.length} đơn hàng</p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Lọc theo trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đang giao</SelectItem>
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
                searchPlaceholder="Tìm đơn hàng..."
                actions={(order) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <>
                          {order.status === "pending" && <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "processing")}><CheckCircle className="mr-2 h-4 w-4" />Chuyển sang đang xử lý</DropdownMenuItem>}
                          {order.status === "processing" && <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "shipped")}><Truck className="mr-2 h-4 w-4" />Chuyển sang đang giao</DropdownMenuItem>}
                          {order.status === "shipped" && <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "delivered")}><CheckCircle className="mr-2 h-4 w-4" />Đánh dấu đã giao</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, "cancelled")}><XCircle className="mr-2 h-4 w-4" />Hủy đơn hàng</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Khách hàng</p><p className="font-medium">{selectedOrder.customer}</p></div>
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedOrder.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Ngày đặt</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Số lượng</p><p className="font-medium">{selectedOrder.items} sản phẩm</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Trạng thái</p><Badge variant="outline" className={cn("capitalize mt-1", statusStyles[selectedOrder.status])}>{getOrderStatusLabel(selectedOrder.status)}</Badge></div>
                <div><p className="text-sm text-muted-foreground">Thanh toán</p><Badge variant="outline" className={cn("capitalize mt-1", paymentStyles[selectedOrder.paymentStatus])}>{getPaymentStatusLabel(selectedOrder.paymentStatus)}</Badge></div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Tổng tiền</p>
                  <p className="text-lg font-semibold">${selectedOrder.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
