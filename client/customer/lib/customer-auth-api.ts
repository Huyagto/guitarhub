import { apiRequest } from "@/lib/api"
import type { AuthUser } from "@/lib/auth"

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

export async function registerCustomer(payload: RegisterPayload) {
  return apiRequest<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
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

export async function getCustomerProfile(accessToken: string) {
  return apiRequest<AuthUser>("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function getCustomerGoogleAuthUrl() {
  return apiRequest<{ url: string }>("/api/auth/google")
}
