"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Loader2, Printer, Search } from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getStoredStaffUser } from "@/lib/auth"
import { getStaffOrderHistory } from "@/lib/order-api"
import type { StaffOrder } from "@/lib/order-types"
import { printOrderReceipt } from "@/lib/staff-receipt"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN")
}

function getSourceLabel(order: StaffOrder) {
  return order.source === "store" ? "Tại quầy" : "Online"
}

const paymentMethodLabels: Record<StaffOrder["paymentMethod"], string> = {
  cod: "COD",
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
  vnpay: "VNPay",
  momo: "MoMo",
  zalopay: "ZaloPay",
}

export default function StaffHistoryPage() {
  const [orders, setOrders] = useState<StaffOrder[]>([])
  const [search, setSearch] = useState("")
  const [source, setSource] = useState<"all" | "online" | "store">("all")
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getStaffOrderHistory()
        setOrders(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải lịch sử đơn hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadHistory()
  }, [])

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSource = source === "all" || order.source === source
      const matchesSearch =
        !keyword ||
        order.orderNumber.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword)
      return matchesSource && matchesSearch
    })
  }, [orders, search, source])

  const summary = useMemo(
    () => ({
      count: filteredOrders.length,
      revenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      store: filteredOrders.filter((order) => order.source === "store").length,
      online: filteredOrders.filter((order) => order.source === "online").length,
    }),
    [filteredOrders]
  )

  return (
    <main className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Đơn trong bộ lọc</p>
              <p className="mt-1 text-2xl font-semibold">{summary.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Doanh thu</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.revenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Tại quầy</p>
              <p className="mt-1 text-2xl font-semibold">{summary.store}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Online</p>
              <p className="mt-1 text-2xl font-semibold">{summary.online}</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đơn hàng</CardTitle>
            <p className="text-sm text-muted-foreground">
              Bao gồm đơn POS tại quầy và đơn online của chi nhánh đang đăng nhập.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm mã đơn, khách hàng, SĐT..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "Tất cả"],
                  ["store", "Tại quầy"],
                  ["online", "Online"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSource(key as "all" | "online" | "store")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      source === key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-right">Tác vụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.phone || order.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSourceLabel(order)}</Badge>
                      </TableCell>
                      <TableCell>{paymentMethodLabels[order.paymentMethod]}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => printOrderReceipt(order, getStoredStaffUser())}>
                            <Printer className="h-4 w-4" />
                            In
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nguồn</p>
                  <p className="font-medium">{getSourceLabel(selectedOrder)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <p className="font-medium uppercase">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thu ngân/xử lý</p>
                  <p className="font-medium">{selectedOrder.handledByStaff?.fullName || "Chưa có"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border">
                <div className="border-b border-border px-4 py-3 text-sm font-medium">Sản phẩm</div>
                <div className="divide-y divide-border">
                  {selectedOrder.lineItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">{item.productSku} x{item.quantity}</p>
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
                {selectedOrder.shippingFee > 0 ? (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                ) : null}
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
