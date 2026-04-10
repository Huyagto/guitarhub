"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/manager-types"
import { cn } from "@/lib/utils"

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">{order.customer}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={cn("capitalize", statusStyles[order.status])}
                >
                  {order.status === "pending"
                    ? "Chờ xử lý"
                    : order.status === "processing"
                    ? "Đang xử lý"
                    : order.status === "shipped"
                    ? "Đang giao"
                    : order.status === "delivered"
                    ? "Đã giao"
                    : "Đã hủy"}
                </Badge>
                <p className="text-sm font-medium text-foreground">
                  ${order.total.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
