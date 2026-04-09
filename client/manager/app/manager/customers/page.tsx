"use client"

import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { customers as initialCustomers, orders, type Customer } from "@/lib/mock-data"
import { MoreHorizontal, Eye, Mail, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Get customer orders
  const getCustomerOrders = (customerEmail: string) => {
    return orders.filter((order) => order.email === customerEmail)
  }

  const columns = [
    {
      key: "name" as const,
      header: "Khách hàng",
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {customer.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium text-foreground">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone" as const,
      header: "Điện thoại",
      render: (customer: Customer) => (
        <span className="text-muted-foreground">{customer.phone}</span>
      ),
    },
    {
      key: "totalOrders" as const,
      header: "Đơn hàng",
      render: (customer: Customer) => (
        <span className="text-muted-foreground">{customer.totalOrders}</span>
      ),
    },
    {
      key: "totalSpent" as const,
      header: "Tổng chi tiêu",
      render: (customer: Customer) => (
        <span className="font-medium">${customer.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (customer: Customer) => (
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            customer.status === "active"
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground border-muted"
          )}
        >
          {customer.status}
        </Badge>
      ),
    },
    {
      key: "joinedAt" as const,
      header: "Ngày tham gia",
      render: (customer: Customer) => (
        <span className="text-muted-foreground">
          {new Date(customer.joinedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Khách hàng" description="Quản lý danh sách khách hàng" />

      <main className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả khách hàng</h2>
                <p className="text-sm text-muted-foreground">
                  Tổng cộng {customers.length} khách hàng
                </p>
              </div>
            </div>

            <DataTable
              data={customers}
              columns={columns}
              searchKey="name"
              searchPlaceholder="Tìm khách hàng..."
              actions={(customer) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>
      </main>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>
              Xem thông tin khách hàng và lịch sử đơn hàng
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                  {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    selectedCustomer.status === "active"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground border-muted"
                  )}
                >
                  {selectedCustomer.status}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                  <p className="text-2xl font-semibold">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-2xl font-semibold">
                    ${selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Thành viên từ</p>
                  <p className="text-2xl font-semibold">
                    {new Date(selectedCustomer.joinedAt).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="mb-3 font-medium">Đơn hàng gần đây</h4>
                <div className="space-y-2">
                  {getCustomerOrders(selectedCustomer.email).length > 0 ? (
                    getCustomerOrders(selectedCustomer.email)
                      .slice(0, 3)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">${order.total.toLocaleString()}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize text-xs",
                                order.status === "delivered"
                                  ? "bg-success/10 text-success border-success/20"
                                  : order.status === "cancelled"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-warning/10 text-warning border-warning/20"
                              )}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Không tìm thấy đơn hàng</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
