'use client'

import { Minus, Plus, Trash2, ShoppingCart, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { type OrderItem, type CustomerInfo, formatCurrency } from '@/lib/pos-data'

interface OrderPanelProps {
  items: OrderItem[]
  customerInfo: CustomerInfo
  discountCode: string
  discountAmount: number
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onCustomerInfoChange: (info: CustomerInfo) => void
  onDiscountCodeChange: (code: string) => void
  onApplyDiscount: () => void
  onCheckout: () => void
}

export function OrderPanel({
  items,
  customerInfo,
  discountCode,
  discountAmount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCustomerInfoChange,
  onDiscountCodeChange,
  onApplyDiscount,
  onCheckout,
}: OrderPanelProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const total = subtotal - discountAmount

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Đơn hàng hiện tại</h2>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-destructive hover:text-destructive"
          >
            Xóa hết
          </Button>
        )}
      </div>

      {/* Order Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có sản phẩm trong đơn
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hãy thêm sản phẩm từ khung bên trái
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start gap-3 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.product.price)} / sản phẩm
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="h-7 w-7"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="h-7 w-7"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Customer Info */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Khách hàng</h3>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <Checkbox
            id="walk-in"
            checked={customerInfo.isWalkIn}
            onCheckedChange={(checked) =>
              onCustomerInfoChange({
                ...customerInfo,
                isWalkIn: checked === true,
                name: checked ? '' : customerInfo.name,
                phone: checked ? '' : customerInfo.phone,
              })
            }
          />
          <label
            htmlFor="walk-in"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Khách mua tại quầy
          </label>
        </div>

        {!customerInfo.isWalkIn && (
          <div className="space-y-2">
            <Input
              placeholder="Tên khách hàng"
              value={customerInfo.name}
              onChange={(e) =>
                onCustomerInfoChange({ ...customerInfo, name: e.target.value })
              }
              className="h-9"
            />
            <Input
              placeholder="Số điện thoại"
              value={customerInfo.phone}
              onChange={(e) =>
                onCustomerInfoChange({ ...customerInfo, phone: e.target.value })
              }
              className="h-9"
            />
          </div>
        )}

        <Input
          placeholder="Ghi chú đơn hàng (không bắt buộc)"
          value={customerInfo.note}
          onChange={(e) =>
            onCustomerInfoChange({ ...customerInfo, note: e.target.value })
          }
          className="mt-2 h-9"
        />
      </div>

      {/* Discount */}
      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Giảm giá</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã"
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
            className="h-9"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onApplyDiscount}
            className="shrink-0"
          >
            Áp dụng
          </Button>
        </div>
        {discountAmount > 0 && (
          <p className="mt-2 text-xs text-green-600">
            Đã áp dụng giảm giá: -{formatCurrency(discountAmount)}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
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

        <Button
          className="mt-4 h-12 w-full text-base"
          size="lg"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Tiến hành thanh toán
        </Button>
      </div>
    </div>
  )
}
