// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  category: Category
  categoryName?: string
  brand: string
  rating: number
  reviewCount: number
  images: string[]
  description: string
  shortDescription: string
  specifications: Record<string, string>
  stock: number
  tags: string[]
  isBestSeller?: boolean
  isNewArrival?: boolean
  createdAt: string
}

export type Category = string

export interface CategoryInfo {
  id: Category
  name: string
  description: string
  image: string
  productCount: number
}

export interface BrandInfo {
  id: string
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  productCount?: number
}

// User Types
export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  avatar?: string
  createdAt: string
}

export interface Address {
  id: string
  userId: string
  recipientName: string
  phone: string
  province: string
  district: string
  ward: string
  detailAddress: string
  isDefault: boolean
}

// Cart Types
export interface CartItem {
  id: string
  product: Product
  quantity: number
  unitPrice?: number
}

// Order Types
export type OrderStatus = 
  | 'awaiting_payment'
  | 'pending'
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipping'
  | 'delivered'
  | 'cancelled'

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  code: string
  userId: string
  items: OrderItem[]
  shippingAddress: Address
  paymentMethod: PaymentMethod
  status: OrderStatus
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  createdAt: string
}

export type PaymentMethod = 'cod' | 'vnpay' | 'momo' | 'zalopay'

// Review Types
export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  rating: number
  comment: string
  createdAt: string
}

// Testimonial Types
export interface Testimonial {
  id: string
  name: string
  role: string
  avatar?: string
  rating: number
  comment: string
}

// Brand Types
export interface Brand {
  id: string
  name: string
  logo: string
}
