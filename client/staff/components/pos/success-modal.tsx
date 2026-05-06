'use client'

import { CheckCircle, Printer, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { StaffAuthUser } from '@/lib/auth'
import { type OrderItem, type CustomerInfo, type PaymentMethod, formatCurrency } from '@/lib/pos-data'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderNumber: string
  items: OrderItem[]
  customerInfo: CustomerInfo
  paymentMethod: PaymentMethod
  total: number
  discountAmount: number
  staff?: StaffAuthUser | null
  onNewOrder: () => void
  onPrintReceipt: () => void
}

const paymentMethodNames: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  'bank-transfer': 'Chuyển khoản',
  vnpay: 'VNPay',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
}

export function SuccessModal({
  open,
  onOpenChange,
  orderNumber,
  items,
  customerInfo,
  paymentMethod,
  total,
  discountAmount,
  staff,
  onNewOrder,
  onPrintReceipt,
}: SuccessModalProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const branchName = staff?.branch ? `${staff.branch.code} - ${staff.branch.name}` : 'GuitarHub'
  const branchAddress = staff?.branch?.address || 'Chi nhánh GuitarHub'
  const cashierName = staff?.fullName || 'Nhân viên'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogTitle className="sr-only">Thanh toán thành công</DialogTitle>
        <DialogDescription className="sr-only">
          Xác nhận đơn hàng và xem trước hóa đơn
        </DialogDescription>
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h2 className="mb-1 text-xl font-semibold text-foreground">
            Thanh toán thành công!
          </h2>
          <p className="text-sm text-muted-foreground">
            Đơn hàng #{orderNumber} đã được tạo
          </p>

          {/* Receipt Preview */}
          <div className="mt-6 w-full rounded-lg border border-border bg-muted/30 p-4 text-left">
            <div className="mb-3 border-b border-dashed border-border pb-3 text-center">
              <h3 className="text-base font-semibold text-foreground">
                {branchName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {branchAddress}
              </p>
            </div>

            <div className="mb-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn:</span>
                <span className="font-medium text-foreground">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="text-foreground">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thu ngân:</span>
                <span className="text-foreground">{cashierName}</span>
              </div>
              {!customerInfo.isWalkIn && customerInfo.name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="text-foreground">{customerInfo.name}</span>
                </div>
              )}
            </div>

            <div className="mb-3 border-t border-dashed border-border pt-3">
              <div className="space-y-2 text-xs">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-foreground">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="text-foreground">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="text-green-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-sm font-semibold">
                <span className="text-foreground">Tổng cộng</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                <span className="text-foreground">
                  {paymentMethodNames[paymentMethod]}
                </span>
              </div>
            </div>

            <div className="mt-3 border-t border-dashed border-border pt-3 text-center text-xs text-muted-foreground">
              <p>Cảm ơn bạn đã mua hàng!</p>
              <p>Hẹn gặp lại bạn lần sau</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex w-full gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPrintReceipt}
            >
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
            <Button className="flex-1" onClick={onNewOrder}>
              <X className="mr-2 h-4 w-4" />
              Đơn mới
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
