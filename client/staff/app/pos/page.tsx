'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Clock, LogOut } from 'lucide-react'
import { ProductGrid } from '@/components/pos/product-grid'
import { OrderPanel } from '@/components/pos/order-panel'
import { PaymentModal } from '@/components/pos/payment-modal'
import { SuccessModal } from '@/components/pos/success-modal'
import { Button } from '@/components/ui/button'
import {
  type Product,
  type OrderItem,
  type CustomerInfo,
  type PaymentMethod,
} from '@/lib/pos-data'
import { clearStaffSession, getStoredStaffUser } from '@/lib/auth'

function generateOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORD-${date}-${random}`
}

export default function POSPage() {
  const router = useRouter()
  // Order state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    note: '',
    isWalkIn: true,
  })
  const [discountCode, setDiscountCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  // Current time - initialize as null to avoid hydration mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [staffName, setStaffName] = useState('Nhân viên')

  // Update time every second - only runs on client
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const user = getStoredStaffUser()
    if (user?.fullName) {
      setStaffName(user.fullName)
    }
  }, [])

  // Calculate total
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const total = subtotal - discountAmount

  // Product handlers
  const handleAddProduct = useCallback((product: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const handleRemoveProduct = useCallback((productId: string) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => i.product.id !== productId)
    })
  }, [])

  const handleUpdateQuantity = useCallback(
    (productId: string, delta: number) => {
      setOrderItems((prev) => {
        const item = prev.find((i) => i.product.id === productId)
        if (!item) return prev

        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) {
          return prev.filter((i) => i.product.id !== productId)
        }
        if (newQuantity > item.product.stock) return prev

        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: newQuantity } : i
        )
      })
    },
    []
  )

  const handleRemoveItem = useCallback((productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const handleClearCart = useCallback(() => {
    setOrderItems([])
    setDiscountCode('')
    setDiscountAmount(0)
  }, [])

  // Discount handler
  const handleApplyDiscount = useCallback(() => {
    if (discountCode.toLowerCase() === 'sale10') {
      setDiscountAmount(Math.floor(subtotal * 0.1))
    } else if (discountCode.toLowerCase() === 'sale20') {
      setDiscountAmount(Math.floor(subtotal * 0.2))
    } else if (discountCode.toLowerCase() === '50k') {
      setDiscountAmount(50000)
    } else {
      setDiscountAmount(0)
    }
  }, [discountCode, subtotal])

  // Payment handlers
  const handleCheckout = useCallback(() => {
    setShowPaymentModal(true)
  }, [])

  const handleConfirmPayment = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
    setOrderNumber(generateOrderNumber())
    setShowPaymentModal(false)
    setShowSuccessModal(true)
  }, [])

  const handleNewOrder = useCallback(() => {
    setShowSuccessModal(false)
    setOrderItems([])
    setCustomerInfo({
      name: '',
      phone: '',
      note: '',
      isWalkIn: true,
    })
    setDiscountCode('')
    setDiscountAmount(0)
  }, [])

  const handlePrintReceipt = useCallback(() => {
    window.print()
  }, [])

  const handleLogout = useCallback(() => {
    clearStaffSession()
    router.push("/login")
  }, [router])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Quầy bán hàng Guitar Shop
            </h1>
            <p className="text-xs text-muted-foreground">Hệ thống bán hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {currentTime && (
              <>
                <span>
                  {currentTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-xs">
                  {currentTime.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {staffName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Product Grid - Left Side */}
        <div className="flex-1 overflow-hidden">
          <ProductGrid
            orderItems={orderItems}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
          />
        </div>

        {/* Order Panel - Right Side */}
        <div className="w-[380px] shrink-0">
          <OrderPanel
            items={orderItems}
            customerInfo={customerInfo}
            discountCode={discountCode}
            discountAmount={discountAmount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCustomerInfoChange={setCustomerInfo}
            onDiscountCodeChange={setDiscountCode}
            onApplyDiscount={handleApplyDiscount}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        items={orderItems}
        total={total}
        discountAmount={discountAmount}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        orderNumber={orderNumber}
        items={orderItems}
        customerInfo={customerInfo}
        paymentMethod={paymentMethod}
        total={total}
        discountAmount={discountAmount}
        onNewOrder={handleNewOrder}
        onPrintReceipt={handlePrintReceipt}
      />
    </div>
  )
}
