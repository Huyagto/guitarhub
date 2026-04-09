import { apiRequest } from "@/lib/api"
import type { ManagerAuthUser } from "@/lib/auth"

interface ManagerLoginResponse {
  user: ManagerAuthUser
  accessToken: string
  refreshToken: string
}

export async function loginManager(payload: { email: string; password: string }) {
  return apiRequest<ManagerLoginResponse>("/api/manager/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getManagerProfile(accessToken: string) {
  return apiRequest<ManagerAuthUser>("/api/manager/auth/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
