import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  shipping: {
    label: "Shipping",
    className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
