'use client'

import { useState, useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { ProductGrid } from '@/components/pos/product-grid'
import { OrderPanel } from '@/components/pos/order-panel'
import { PaymentModal } from '@/components/pos/payment-modal'
import { SuccessModal } from '@/components/pos/success-modal'
import {
  type Product,
  type OrderItem,
  type CustomerInfo,
  type PaymentMethod,
} from '@/lib/pos-data'
import { createPosOrder, getPosCatalog, validatePosVoucher } from '@/lib/pos-api'
import { getErrorMessage } from '@/lib/api'

const POS_CATALOG_CACHE_KEY = 'staff_pos_catalog_cache'

export default function POSPage() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
  const [catalogCategories, setCatalogCategories] = useState<Array<{ id: string; name: string }>>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', note: '', isWalkIn: true })
  const [discountCode, setDiscountCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountError, setDiscountError] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  useEffect(() => {
    const loadCatalog = async () => {
      if (typeof window !== 'undefined') {
        const cachedCatalog = window.sessionStorage.getItem(POS_CATALOG_CACHE_KEY)
        if (cachedCatalog) {
          try {
            const parsed = JSON.parse(cachedCatalog) as {
              categories: Array<{ id: string; name: string }>
              products: Product[]
            }
            setCatalogCategories(parsed.categories)
            setCatalogProducts(parsed.products)
            setCatalogLoading(false)
          } catch {
            window.sessionStorage.removeItem(POS_CATALOG_CACHE_KEY)
          }
        }
      }

      try {
        const response = await getPosCatalog()
        setCatalogCategories(response.metadata.categories)
        setCatalogProducts(response.metadata.products)
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            POS_CATALOG_CACHE_KEY,
            JSON.stringify(response.metadata)
          )
        }
      } catch (loadError) {
        setCatalogError(getErrorMessage(loadError, 'Không thể tải danh mục bán hàng'))
      } finally {
        setCatalogLoading(false)
      }
    }

    void loadCatalog()
  }, [])

  const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const total = subtotal - discountAmount

  const handleAddProduct = useCallback((product: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const handleRemoveProduct = useCallback((productId: string) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
      }
      return prev.filter((item) => item.product.id !== productId)
    })
  }, [])

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setOrderItems((prev) => {
      const item = prev.find((entry) => entry.product.id === productId)
      if (!item) return prev

      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) return prev.filter((entry) => entry.product.id !== productId)
      if (newQuantity > item.product.stock) return prev
      return prev.map((entry) => entry.product.id === productId ? { ...entry, quantity: newQuantity } : entry)
    })
  }, [])

  const handleRemoveItem = useCallback((productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const handleClearCart = useCallback(() => {
    setOrderItems([])
    setDiscountCode('')
    setDiscountAmount(0)
  }, [])

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCode.trim()) {
      setDiscountAmount(0)
      setDiscountError('')
      return
    }
    if (subtotal <= 0) {
      setDiscountError('Vui lòng thêm sản phẩm trước khi áp mã')
      return
    }
    setIsApplyingDiscount(true)
    setDiscountError('')
    try {
      const response = await validatePosVoucher(discountCode, subtotal)
      setDiscountAmount(response.metadata.discountAmount)
    } catch (err) {
      setDiscountAmount(0)
      setDiscountError(getErrorMessage(err, 'Mã giảm giá không hợp lệ'))
    } finally {
      setIsApplyingDiscount(false)
    }
  }, [discountCode, subtotal])

  const handleCheckout = useCallback(() => setShowPaymentModal(true), [])

  const handleConfirmPayment = useCallback(async (method: PaymentMethod) => {
    setIsCreatingOrder(true)
    setOrderError('')
    try {
      const payload = {
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        note: customerInfo.note || undefined,
        paymentMethod: method,
        items: orderItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totals: { discountAmount },
      }
      const response = await createPosOrder(payload)
      setPaymentMethod(method)
      setOrderNumber(response.metadata.orderNumber)
      setShowPaymentModal(false)
      setShowSuccessModal(true)

      // Invalidate catalog cache so stock counts refresh next load
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(POS_CATALOG_CACHE_KEY)
      }
    } catch (err) {
      setOrderError(getErrorMessage(err, 'Không thể tạo đơn hàng, vui lòng thử lại'))
    } finally {
      setIsCreatingOrder(false)
    }
  }, [orderItems, customerInfo, discountAmount])

  const handleNewOrder = useCallback(() => {
    setShowSuccessModal(false)
    setOrderItems([])
    setCustomerInfo({ name: '', phone: '', note: '', isWalkIn: true })
    setDiscountCode('')
    setDiscountAmount(0)
    setDiscountError('')
    setOrderError('')
  }, [])

  const handlePrintReceipt = useCallback(() => {
    window.print()
  }, [])

  return (
    <>
      {catalogError ? (
        <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{catalogError}</div>
      ) : null}

      <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {catalogLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ProductGrid
              categories={catalogCategories}
              products={catalogProducts}
              orderItems={orderItems}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
            />
          )}
        </div>

        <div className="w-[380px] shrink-0">
          <OrderPanel
            items={orderItems}
            customerInfo={customerInfo}
            discountCode={discountCode}
            discountAmount={discountAmount}
            discountError={discountError}
            isApplyingDiscount={isApplyingDiscount}
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

      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        items={orderItems}
        total={total}
        discountAmount={discountAmount}
        isCreatingOrder={isCreatingOrder}
        orderError={orderError}
        onConfirmPayment={handleConfirmPayment}
      />

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
    </>
  )
}
