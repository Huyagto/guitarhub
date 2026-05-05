const ACCESS_TOKEN_KEY = "staff_access_token"
const REFRESH_TOKEN_KEY = "staff_refresh_token"
const USER_KEY = "staff_auth_user"

export interface StaffAuthUser {
  id: number
  email: string
  fullName: string
  role: "STAFF"
  staffCode?: string
  branchId?: number | null
  branch?: {
    id: number
    name: string
    code: string
    address?: string | null
  } | null
  isActive?: boolean
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function saveStaffSession(session: {
  accessToken: string
  refreshToken: string
  user: StaffAuthUser
}) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function getStaffAccessToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredStaffUser(): StaffAuthUser | null {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StaffAuthUser
  } catch {
    return null
  }
}

export function clearStaffSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}
