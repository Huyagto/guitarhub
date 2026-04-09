'use client'

import { useState } from 'react'
import {
  Banknote,
  Building,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type PaymentMethod, type OrderItem, formatCurrency } from '@/lib/pos-data'
import { cn } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: OrderItem[]
  total: number
  discountAmount: number
  onConfirmPayment: (method: PaymentMethod) => void
}

const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode }[] = [
  { id: 'cash', name: 'Tiền mặt', icon: <Banknote className="h-5 w-5" /> },
  { id: 'bank-transfer', name: 'Chuyển khoản', icon: <Building className="h-5 w-5" /> },
  { id: 'vnpay', name: 'VNPay', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'momo', name: 'MoMo', icon: <Smartphone className="h-5 w-5" /> },
  { id: 'zalopay', name: 'ZaloPay', icon: <Wallet className="h-5 w-5" /> },
]

export function PaymentModal({
  open,
  onOpenChange,
  items,
  total,
  discountAmount,
  onConfirmPayment,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash')
  const [cashReceived, setCashReceived] = useState('')

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const cashAmount = parseFloat(cashReceived.replace(/[^0-9]/g, '')) || 0
  const changeAmount = cashAmount - total

  const canConfirm =
    selectedMethod !== 'cash' || (selectedMethod === 'cash' && cashAmount >= total)

  const handleConfirm = () => {
    onConfirmPayment(selectedMethod)
    setCashReceived('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Thanh toán</DialogTitle>
          <DialogDescription className="sr-only">
            Hoàn tất thanh toán cho đơn hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Tóm tắt đơn hàng
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Sản phẩm ({items.reduce((sum, i) => sum + i.quantity, 0)})
                </span>
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
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span className="text-foreground">Tổng cộng</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-full p-2',
                      selectedMethod === method.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {method.icon}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      selectedMethod === method.id
                        ? 'text-primary'
                        : 'text-foreground'
                    )}
                  >
                    {method.name}
                  </span>
                  {selectedMethod === method.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input */}
          {selectedMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tiền khách đưa
                </label>
                <Input
                  type="text"
                  placeholder="Nhập số tiền"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              {cashAmount > 0 && (
                <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Tiền thừa</span>
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      changeAmount >= 0 ? 'text-green-600' : 'text-destructive'
                    )}
                  >
                    {formatCurrency(Math.max(0, changeAmount))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <Button
            className="h-12 w-full text-base"
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Xác nhận thanh toán
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
