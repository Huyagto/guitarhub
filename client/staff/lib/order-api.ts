import { apiRequest } from "@/lib/api"
import { getStaffAccessToken } from "@/lib/auth"
import type { StaffOrder, StaffOrderStatus } from "@/lib/order-types"

function getStaffHeaders() {
  const token = getStaffAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function staffRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const authHeaders = getStaffHeaders()

  Object.entries(authHeaders).forEach(([key, value]) => headers.set(key, value))

  return apiRequest<T>(path, {
    ...init,
    headers,
  })
}

export async function getStaffOrders() {
  return staffRequest<StaffOrder[]>("/api/staff/orders")
}

export async function updateStaffOrderStatus(id: string, status: StaffOrderStatus) {
  return staffRequest<StaffOrder>(`/api/staff/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
