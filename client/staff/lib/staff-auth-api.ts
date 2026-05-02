import { apiRequest } from "@/lib/api"
import type { StaffAuthUser } from "@/lib/auth"

interface StaffLoginResponse {
  user: StaffAuthUser
  accessToken: string
  refreshToken: string
}

export async function loginStaff(payload: { staffCode: string; password: string }) {
  return apiRequest<StaffLoginResponse>("/api/staff/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getStaffProfile(accessToken: string) {
  return apiRequest<StaffAuthUser>("/api/staff/auth/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
