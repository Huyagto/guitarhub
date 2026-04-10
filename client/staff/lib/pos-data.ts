export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  stock: number
  sku: string
}

export interface OrderItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  note: string
  isWalkIn: boolean
}

export type PaymentMethod = "cash" | "bank-transfer" | "vnpay" | "momo" | "zalopay"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}
