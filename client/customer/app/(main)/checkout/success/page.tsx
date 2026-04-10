import Link from "next/link"
import { CheckCircle2, Package, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CheckoutSuccessPageProps {
  searchParams?: Promise<{
    orderCode?: string
    paymentMethod?: string
    status?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = (await searchParams) || {}
  const orderCode = params.orderCode || `GH-${Date.now()}`
  const paymentMethod = (params.paymentMethod || "cod").toUpperCase()
  const isSuccess = (params.status || "success") === "success"

  return (
    <div className="py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
          {isSuccess ? (
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          ) : (
            <AlertCircle className="h-10 w-10 text-red-600" />
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          {isSuccess ? "Đặt hàng thành công!" : "Thanh toán chưa hoàn tất"}
        </h1>

        <p className="mt-4 text-muted-foreground">
          {isSuccess
            ? "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và đang được xử lý."
            : "Giao dịch chưa hoàn tất hoặc đã bị hủy. Bạn có thể quay lại giỏ hàng để thử lại."}
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
          <p className="mt-1 text-xl font-bold text-foreground">{orderCode}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Phương thức thanh toán: {paymentMethod}
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-muted/50 p-6">
          <div className="flex items-center justify-center gap-3 text-accent">
            <Package className="h-5 w-5" />
            <span className="font-medium">
              {isSuccess ? "Dự kiến giao hàng: 3-5 ngày làm việc" : "Bạn có thể thử lại thanh toán bất kỳ lúc nào"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isSuccess ? (
            <Button asChild>
              <Link href="/profile">
                Xem hồ sơ tài khoản
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/checkout">
                Quay lại thanh toán
              </Link>
            </Button>
          )}
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
