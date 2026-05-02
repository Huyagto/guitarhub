import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  awaiting_payment: {
    label: "Chờ thanh toán",
    className: "bg-slate-100 text-slate-800 hover:bg-slate-100",
  },
  pending: {
    label: "Đang chờ",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  pending_confirmation: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  preparing: {
    label: "Đang chuẩn bị",
    className: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  },
  ready_to_ship: {
    label: "Sẵn sàng giao",
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  },
  shipping: {
    label: "Đang giao",
    className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  },
  delivered: {
    label: "Đã giao",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  cancelled: {
    label: "Đã hủy",
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
