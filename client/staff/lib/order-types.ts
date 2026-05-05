export type StaffOrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "shipping"
  | "delivered"
  | "cancelled"

export type StaffPaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type StaffPaymentMethod = "cod" | "vnpay" | "momo" | "zalopay"

export interface StaffOrderLineItem {
  id: string
  productId: string
  productName: string
  productSku: string
  image: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface StaffOrder {
  id: string
  customerId: string | null
  orderNumber: string
  customer: string
  email: string
  phone: string
  items: number
  subtotal: number
  shippingFee: number
  total: number
  status: StaffOrderStatus
  paymentStatus: StaffPaymentStatus
  paymentMethod: StaffPaymentMethod
  source?: "online" | "store"
  branch?: {
    id: string
    name: string
    code: string
  } | null
  note: string
  createdAt: string
  updatedAt: string
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
  lineItems: StaffOrderLineItem[]
}
