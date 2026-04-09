const ACCESS_TOKEN_KEY = "customer_access_token"
const REFRESH_TOKEN_KEY = "customer_refresh_token"
const USER_KEY = "customer_auth_user"
const RESET_EMAIL_KEY = "customer_reset_email"

export interface AuthUser {
  id: number
  fullName: string
  email: string
  phone?: string
  avatar?: string
  createdAt?: string
  role?: "CUSTOMER" | "STAFF" | "MANAGER"
  isActive?: boolean
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function saveAuthSession(session: {
  accessToken: string
  refreshToken: string
  user: AuthUser
}) {
  if (!isBrowser()) return

  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function getAccessToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearAuthSession() {
  if (!isBrowser()) return

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function setResetEmail(email: string) {
  if (!isBrowser()) return
  window.localStorage.setItem(RESET_EMAIL_KEY, email)
}

export function getResetEmail() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(RESET_EMAIL_KEY)
}

export function clearResetEmail() {
  if (!isBrowser()) return
  window.localStorage.removeItem(RESET_EMAIL_KEY)
}
