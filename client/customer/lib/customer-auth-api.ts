import { apiRequest } from "@/lib/api"
import type { AuthUser } from "@/lib/auth"
import type { StoredShippingAddress } from "@/lib/shipping-address"
import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from "@/lib/types"

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
  phone?: string
}

interface LoginPayload {
  email: string
  password: string
}

export interface CustomerOrderLineItem {
  id: string
  productId: string
  productName: string
  productSku: string
  image: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CustomerOrder {
  id: string
  customerId: string
  orderNumber: string
  customer: string
  email: string
  phone: string
  items: number
  total: number
  subtotal: number
  shippingFee: number
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentMethod: PaymentMethod
  note: string
  createdAt: string
  updatedAt: string
  shippingInfo: {
    recipientName?: string
    phone?: string
    detailAddress?: string
    ward?: string
    district?: string
    province?: string
    note?: string
  }
  branch: {
    id: string
    name: string
    code: string
  } | null
  handledByStaff: {
    id: string
    fullName: string
    email: string
  } | null
  lineItems: CustomerOrderLineItem[]
  statusHistory?: Array<{
    id: string
    fromStatus: OrderStatus | null
    toStatus: OrderStatus
    note: string
    createdAt: string
    changedBy: {
      id: string
      fullName: string
      email: string
      role: string
    } | null
  }>
}

export async function registerCustomer(payload: RegisterPayload) {
  return apiRequest<{ email: string; expiresInMinutes: number }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function verifyCustomerRegistration(email: string, otp: string) {
  return apiRequest<AuthUser>("/api/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  })
}

export async function loginCustomer(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function forgotCustomerPassword(email: string) {
  return apiRequest<null>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function verifyCustomerOtp(email: string, otp: string) {
  return apiRequest<{ resetToken: string }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  })
}

export async function resetCustomerPassword(resetToken: string, newPassword: string) {
  return apiRequest<null>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  })
}

export async function changeCustomerPassword(
  accessToken: string,
  payload: {
    currentPassword: string
    newPassword: string
  }
) {
  return apiRequest<null>("/api/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function getCustomerProfile(accessToken: string) {
  return apiRequest<AuthUser>("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function updateCustomerProfile(
  accessToken: string,
  payload: { fullName: string; phone?: string }
) {
  return apiRequest<AuthUser>("/api/auth/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateCustomerDefaultShippingAddress(
  accessToken: string,
  payload: StoredShippingAddress
) {
  return apiRequest<AuthUser>("/api/auth/profile/address", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function getCustomerGoogleAuthUrl() {
  return apiRequest<{ url: string }>("/api/auth/google")
}

export async function getCustomerOrders(accessToken: string) {
  return apiRequest<CustomerOrder[]>("/api/orders", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function getCustomerOrder(accessToken: string, orderId: string) {
  return apiRequest<CustomerOrder>(`/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function cancelCustomerOrder(accessToken: string, orderId: string) {
  return apiRequest<CustomerOrder>(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
