import Link from "next/link"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  const orderCode = `GS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  return (
    <div className="py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Đặt hàng thành công!
        </h1>

        <p className="mt-4 text-muted-foreground">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
          <p className="mt-1 text-xl font-bold text-foreground">{orderCode}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Email xác nhận đã được gửi đến địa chỉ email của bạn cùng với chi tiết đơn hàng.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-muted/50 p-6">
          <div className="flex items-center justify-center gap-3 text-accent">
            <Package className="h-5 w-5" />
            <span className="font-medium">Dự kiến giao hàng: 3-5 ngày làm việc</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/profile/orders">
              Xem lịch sử đơn hàng
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
