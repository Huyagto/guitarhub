"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, LockKeyhole, ReceiptText } from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getStaffOrderHistory } from "@/lib/order-api"
import type { StaffOrder } from "@/lib/order-types"
import { closeShift, getShiftCloses, type ShiftCloseRecord } from "@/lib/shift-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function isToday(value: string) {
  const date = new Date(value)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function StaffShiftPage() {
  const [orders, setOrders] = useState<StaffOrder[]>([])
  const [closedRecords, setClosedRecords] = useState<ShiftCloseRecord[]>([])
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState("")
  const [closedMessage, setClosedMessage] = useState("")

  useEffect(() => {
    const loadShiftData = async () => {
      try {
        const [ordersResponse, shiftResponse] = await Promise.all([
          getStaffOrderHistory(),
          getShiftCloses(),
        ])
        setOrders(ordersResponse.metadata)
        setClosedRecords(shiftResponse.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu đóng ca"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadShiftData()
  }, [])

  const todayOrders = useMemo(
    () => orders.filter((order) => isToday(order.createdAt) && order.status !== "cancelled"),
    [orders]
  )

  const summary = useMemo(
    () => {
      const paidOrders = todayOrders.filter((order) => order.paymentStatus === "paid")

      return {
        orderCount: todayOrders.length,
        storeOrderCount: todayOrders.filter((order) => order.source === "store").length,
        onlineOrderCount: todayOrders.filter((order) => order.source === "online").length,
        revenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
        cashRevenue: paidOrders
        .filter((order) => order.paymentMethod === "cash" || order.paymentMethod === "cod")
        .reduce((sum, order) => sum + order.total, 0),
        transferRevenue: paidOrders
        .filter((order) => order.paymentMethod !== "cash" && order.paymentMethod !== "cod")
        .reduce((sum, order) => sum + order.total, 0),
      }
    },
    [todayOrders]
  )

  const handleCloseShift = async () => {
    setIsClosing(true)
    setError("")
    try {
      const response = await closeShift(note)
      const record = response.metadata
      setClosedRecords((prev) => [record, ...prev.filter((item) => item.id !== record.id)].slice(0, 20))
      setNote("")
      setClosedMessage(`Đã đóng ca lúc ${new Date(record.closedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`)
    } catch (closeError) {
      setError(getErrorMessage(closeError, "Không thể đóng ca"))
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <main className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {closedMessage ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {closedMessage}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Đơn hôm nay</p>
              <p className="mt-1 text-2xl font-semibold">{summary.orderCount}</p>
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
              <p className="text-sm text-muted-foreground">Tiền mặt/COD</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.cashRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Chuyển khoản/ví</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.transferRevenue)}</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Đơn trong ca hôm nay</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dùng danh sách này để đối soát trước khi đóng ca.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.source === "store" ? "Tại quầy" : "Online"}</TableCell>
                        <TableCell className="uppercase">{order.paymentMethod}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />
                Đóng ca
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Lưu biên bản đóng ca trên thiết bị này để đối soát nhanh.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tại quầy</span>
                  <span className="font-medium">{summary.storeOrderCount} đơn</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Online</span>
                  <span className="font-medium">{summary.onlineOrderCount} đơn</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <span className="font-semibold">Tổng thu</span>
                  <span className="font-semibold">{formatCurrency(summary.revenue)}</span>
                </div>
              </div>

              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ghi chú ca nếu có"
              />

              <Button className="w-full" size="lg" disabled={isLoading || isClosing} onClick={handleCloseShift}>
                {isClosing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ReceiptText className="mr-2 h-4 w-4" />
                )}
                {isClosing ? "Đang đóng ca..." : "Xác nhận đóng ca"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đóng ca trên máy này</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead className="text-right">Đơn</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.closedAt).toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{record.staffName}</TableCell>
                    <TableCell>{record.branchName}</TableCell>
                    <TableCell className="text-right">{record.orderCount}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(record.revenue)}</TableCell>
                    <TableCell className="text-muted-foreground">{record.note || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
