"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Customer, Order } from "@/lib/manager-types"
import { ArrowRight, Eye, Loader2, Mail, MoreHorizontal, ShoppingCart, Ticket, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { getManagerCustomers, getManagerOrders } from "@/lib/manager-data-api"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, ordersRes] = await Promise.all([getManagerCustomers(), getManagerOrders()])
        setCustomers(customersRes.metadata)
        setOrders(ordersRes.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu khách hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const getCustomerOrders = (customerEmail: string) => orders.filter((order) => order.email === customerEmail)

  const columns = [
    {
      key: "name" as const,
      header: "Khách hàng",
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {customer.name.split(" ").map((part) => part[0]).join("")}
          </div>
          <div>
            <p className="font-medium text-foreground">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone" as const, header: "Điện thoại", render: (customer: Customer) => <span className="text-muted-foreground">{customer.phone}</span> },
    { key: "totalOrders" as const, header: "Đơn hàng", render: (customer: Customer) => <span className="text-muted-foreground">{customer.totalOrders}</span> },
    { key: "totalSpent" as const, header: "Tổng chi tiêu", render: (customer: Customer) => <span className="font-medium">${customer.totalSpent.toLocaleString()}</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (customer: Customer) => (
        <Badge variant="outline" className={cn("capitalize", customer.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted")}>
          {customer.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Badge>
      ),
    },
    { key: "joinedAt" as const, header: "Ngày tham gia", render: (customer: Customer) => <span className="text-muted-foreground">{new Date(customer.joinedAt).toLocaleDateString()}</span> },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Trung tâm khách hàng" description="Theo dõi khách hàng, đơn hàng và ưu đãi trong khu làm việc tập trung vào trải nghiệm mua sắm." />
      <main className="p-6 space-y-6">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-sky-500/15 via-background to-background p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Customer Mode</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">Khu chăm sóc khách hàng</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Workspace này gom toàn bộ luồng khách hàng, đơn hàng và ưu đãi để bạn tập trung vào giữ chân người mua và tăng chuyển đổi.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link href="/manager/orders">Xem đơn hàng<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild variant="outline"><Link href="/manager/vouchers">Quản lý voucher</Link></Button>
            </div>
          </div>
        </section>

        {error ? <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-card border-border"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tổng khách hàng</p><p className="mt-1 text-2xl font-bold text-foreground">{customers.length}</p></div><div className="rounded-2xl bg-sky-500/10 p-3"><Users className="h-5 w-5 text-sky-600" /></div></div></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Đơn đang xử lý</p><p className="mt-1 text-2xl font-bold text-foreground">{orders.filter((order) => order.status === "pending" || order.status === "processing").length}</p></div><div className="rounded-2xl bg-amber-500/10 p-3"><ShoppingCart className="h-5 w-5 text-amber-600" /></div></div></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Khách hàng hoạt động</p><p className="mt-1 text-2xl font-bold text-foreground">{customers.filter((customer) => customer.status === "active").length}</p></div><div className="rounded-2xl bg-emerald-500/10 p-3"><Wallet className="h-5 w-5 text-emerald-600" /></div></div></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Ưu đãi đang chạy</p><p className="mt-1 text-2xl font-bold text-foreground">4</p></div><div className="rounded-2xl bg-fuchsia-500/10 p-3"><Ticket className="h-5 w-5 text-fuchsia-600" /></div></div></CardContent></Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Tất cả khách hàng</h2>
                    <p className="text-sm text-muted-foreground">Tổng cộng {customers.length} khách hàng</p>
                  </div>
                </div>
                <DataTable
                  data={customers}
                  columns={columns}
                  searchKey="name"
                  searchPlaceholder="Tìm khách hàng..."
                  actions={(customer) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}><Eye className="mr-2 h-4 w-4" />Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Gửi email</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>Xem thông tin khách hàng và lịch sử đơn hàng</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">{selectedCustomer.name.split(" ").map((part) => part[0]).join("")}</div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
                <Badge variant="outline" className={cn("capitalize", selectedCustomer.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted")}>{selectedCustomer.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4"><p className="text-sm text-muted-foreground">Tổng đơn hàng</p><p className="text-2xl font-semibold">{selectedCustomer.totalOrders}</p></div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4"><p className="text-sm text-muted-foreground">Tổng chi tiêu</p><p className="text-2xl font-semibold">${selectedCustomer.totalSpent.toLocaleString()}</p></div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4"><p className="text-sm text-muted-foreground">Thành viên từ</p><p className="text-2xl font-semibold">{new Date(selectedCustomer.joinedAt).getFullYear()}</p></div>
              </div>
              <div>
                <h4 className="mb-3 font-medium">Đơn hàng gần đây</h4>
                <div className="space-y-2">
                  {getCustomerOrders(selectedCustomer.email).length > 0 ? getCustomerOrders(selectedCustomer.email).slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div><p className="text-sm font-medium">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                      <div className="text-right"><p className="text-sm font-medium">${order.total.toLocaleString()}</p><Badge variant="outline" className={cn("capitalize text-xs", order.status === "delivered" ? "bg-success/10 text-success border-success/20" : order.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20")}>{order.status === "pending" ? "Chờ xử lý" : order.status === "processing" ? "Đang xử lý" : order.status === "shipped" ? "Đang giao" : order.status === "delivered" ? "Đã giao" : "Đã hủy"}</Badge></div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Không tìm thấy đơn hàng</p>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelectedCustomer(null)}>Đóng</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
