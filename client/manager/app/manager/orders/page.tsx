"use client"

import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { orders as initialOrders, type Order } from "@/lib/mock-data"
import { MoreHorizontal, Eye, Truck, XCircle, CheckCircle, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((order) => order.status === statusFilter)

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const columns = [
    {
      key: "orderNumber" as const,
      header: "Order",
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "customer" as const,
      header: "Customer",
      render: (order: Order) => (
        <div>
          <p className="font-medium text-foreground">{order.customer}</p>
          <p className="text-sm text-muted-foreground">{order.email}</p>
        </div>
      ),
    },
    {
      key: "items" as const,
      header: "Items",
      render: (order: Order) => (
        <span className="text-muted-foreground">{order.items} items</span>
      ),
    },
    {
      key: "total" as const,
      header: "Total",
      render: (order: Order) => (
        <span className="font-medium">${order.total.toLocaleString()}</span>
      ),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
          {order.status}
        </Badge>
      ),
    },
    {
      key: "paymentStatus" as const,
      header: "Payment",
      render: (order: Order) => (
        <Badge variant="outline" className={cn("capitalize", paymentStyles[order.paymentStatus])}>
          {order.paymentStatus}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Orders" description="Manage customer orders" />

      <main className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">All Orders</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} orders
                </p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredOrders}
              columns={columns}
              searchKey="orderNumber"
              searchPlaceholder="Search orders..."
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <>
                        {order.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, "processing")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Processing
                          </DropdownMenuItem>
                        )}
                        {order.status === "processing" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, "shipped")}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Mark Shipped
                          </DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, "delivered")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Delivered
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleStatusUpdate(order.id, "cancelled")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Order
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items</p>
                  <p className="font-medium">{selectedOrder.items} items</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn("capitalize mt-1", statusStyles[selectedOrder.status])}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <Badge
                    variant="outline"
                    className={cn("capitalize mt-1", paymentStyles[selectedOrder.paymentStatus])}
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-lg font-semibold">${selectedOrder.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
