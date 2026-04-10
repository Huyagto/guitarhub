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
  productCount: number
  status: "active" | "inactive"
}

export interface Brand {
  id: string
  name: string
  logo: string
  productCount: number
  status: "active" | "inactive"
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "paid" | "pending" | "refunded"
  createdAt: string
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
