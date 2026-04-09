const ACCESS_TOKEN_KEY = "manager_access_token"
const REFRESH_TOKEN_KEY = "manager_refresh_token"
const USER_KEY = "manager_auth_user"

export interface ManagerAuthUser {
  id: number
  email: string
  fullName: string
  role: "MANAGER"
  isActive?: boolean
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function saveManagerSession(session: {
  accessToken: string
  refreshToken: string
  user: ManagerAuthUser
}) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function getManagerAccessToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredManagerUser(): ManagerAuthUser | null {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ManagerAuthUser
  } catch {
    return null
  }
}

export function clearManagerSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}
