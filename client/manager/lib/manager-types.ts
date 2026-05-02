export interface Staff {
  id: string
  fullName: string
  email: string
  phone: string
  staffCode: string
  branchId?: string
  branch?: {
    id: string
    name: string
    code: string
  } | null
  isActive: boolean
  createdAt: string
}

export interface Branch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  status: "active" | "inactive"
  staffCount: number
  inventoryItems: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug?: string
  sku: string
  categoryId?: string
  category: string
  categorySlug?: string | null
  brandId?: string
  brand: string
  price: number
  stock: number
  status: "active" | "draft" | "archived"
  image: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  image?: string | null
  productCount: number
  status: "active" | "inactive"
}

export interface Brand {
  id: string
  name: string
  logo?: string | null
  productCount: number
  status: "active" | "inactive"
}

export type OrderStatus =
  | "awaiting_payment"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "shipping"
  | "delivered"
  | "cancelled"

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type OrderPaymentMethod = "cod" | "vnpay" | "momo" | "zalopay" | "cash" | "bank_transfer"

export interface OrderLineItem {
  id: string
  productId: string
  productName: string
  productSku: string
  image: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: string
  customerId: string | null
  orderNumber: string
  customer: string
  email: string
  phone?: string
  items: number
  subtotal?: number
  shippingFee?: number
  total: number
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentMethod?: OrderPaymentMethod
  source?: "online" | "store"
  branch?: {
    id: string
    name: string
    code: string
  } | null
  note?: string
  createdAt: string
  updatedAt?: string
  shippingInfo?: {
    recipientName?: string
    phone?: string
    province?: string
    district?: string
    ward?: string
    detailAddress?: string
    displayName?: string
  }
  handledByStaff?: {
    id: string
    fullName: string
    email: string
  } | null
  lineItems?: OrderLineItem[]
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  joinedAt: string
}

export interface InventoryItem {
  id: string
  branchId?: string
  branchName?: string
  productId: string
  productName: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastRestocked: string
}

export interface Voucher {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase: number
  usageLimit: number
  usedCount: number
  status: "active" | "expired" | "disabled"
  expiresAt: string
}
