import { apiRequest } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import type { PaymentMethod } from "@/lib/types"

interface CheckoutPayload {
  paymentMethod: PaymentMethod
  branchId: string
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
  inventory: Array<{ productId: string; productName: string; sku: string; stock: number }>
}

interface CheckoutResponse {
  orderCode: string
  paymentMethod: PaymentMethod
  paymentUrl?: string
  redirectUrl?: string
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

export async function getAvailableCheckoutBranches(productIds: string[]) {
  const response = await apiRequest<AvailableBranch[]>(
    `/api/products/branches/available?productIds=${productIds.join(",")}`
  )

  return response.metadata
}
