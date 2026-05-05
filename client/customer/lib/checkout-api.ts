import { apiRequest } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import type { PaymentMethod } from "@/lib/types"

interface CheckoutPayload {
  paymentMethod: PaymentMethod
  branchId: string
  voucherCode?: string
  shippingInfo: {
    recipientName: string
    phone: string
    province: string
    district: string
    ward: string
    detailAddress: string
    displayName?: string
    lat?: string
    lon?: string
  }
}

export interface AvailableBranch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  latitude: number | null
  longitude: number | null
  distanceKm: number | null
  inventory: Array<{ productId: string; productName: string; sku: string; stock: number }>
}

interface CheckoutResponse {
  orderCode: string
  paymentMethod: PaymentMethod
  paymentUrl?: string
  redirectUrl?: string
}

export interface CheckoutPreview {
  subtotal: number
  discountAmount: number
  shippingFee: number
  distanceKm: number
  total: number
  voucher: { code: string; discountAmount: number } | null
}

export async function createCheckout(payload: CheckoutPayload) {
  const accessToken = getAccessToken()

  if (!accessToken) {
    throw new Error("Vui lòng đăng nhập để thanh toán")
  }

  const response = await apiRequest<CheckoutResponse>("/api/payments/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  return response.metadata
}

export async function previewCheckout(payload: {
  branchId: string
  voucherCode?: string
  shippingInfo: { lat?: string; lon?: string }
}) {
  const accessToken = getAccessToken()
  if (!accessToken) throw new Error("Vui lòng đăng nhập")

  const response = await apiRequest<CheckoutPreview>("/api/payments/checkout/preview", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  })
  return response.metadata
}

export async function getAvailableCheckoutBranches(productIds: string[], location?: { lat?: string; lon?: string }) {
  const params = new URLSearchParams({ productIds: productIds.join(",") })
  if (location?.lat && location?.lon) {
    params.set("lat", location.lat)
    params.set("lon", location.lon)
  }

  const response = await apiRequest<AvailableBranch[]>(
    `/api/products/branches/available?${params.toString()}`
  )

  return response.metadata
}
