import { apiRequest } from "@/lib/api"
import { getStaffAccessToken } from "@/lib/auth"

export interface ShiftCloseRecord {
  id: string
  staffId: string
  staffName: string
  branchId: string
  branchName: string
  businessDate: string
  closedAt: string
  orderCount: number
  storeOrderCount: number
  onlineOrderCount: number
  revenue: number
  cashRevenue: number
  transferRevenue: number
  note: string
}

function staffRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const token = getStaffAccessToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  return apiRequest<T>(path, {
    ...init,
    headers,
  })
}

export function getShiftCloses() {
  return staffRequest<ShiftCloseRecord[]>("/api/staff/pos/shifts")
}

export function closeShift(note: string) {
  return staffRequest<ShiftCloseRecord>("/api/staff/pos/shifts/close", {
    method: "POST",
    body: JSON.stringify({ note }),
  })
}
