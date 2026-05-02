export const CUSTOMER_NOTIFICATIONS_CHANGED_EVENT = "customer-notifications-changed"

export interface CustomerNotification {
  id: string
  type: "order_created" | "order_updated"
  title: string
  message: string
  orderNumber?: string
  status?: string
  createdAt: string
  read: boolean
  href?: string
}

function isBrowser() {
  return typeof window !== "undefined"
}

function getStorageKey(userId?: number | string | null) {
  return `customer_notifications_${userId || "guest"}`
}

function emitNotificationsChanged() {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(CUSTOMER_NOTIFICATIONS_CHANGED_EVENT))
}

export function getCustomerNotifications(userId?: number | string | null) {
  if (!isBrowser()) return []

  const raw = window.localStorage.getItem(getStorageKey(userId))
  if (!raw) return []

  try {
    return JSON.parse(raw) as CustomerNotification[]
  } catch {
    return []
  }
}

export function saveCustomerNotifications(
  notifications: CustomerNotification[],
  userId?: number | string | null
) {
  if (!isBrowser()) return

  window.localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(notifications.slice(0, 20))
  )
  emitNotificationsChanged()
}

export function pushCustomerNotification(
  notification: CustomerNotification,
  userId?: number | string | null
) {
  const current = getCustomerNotifications(userId)
  const next = [
    notification,
    ...current.filter((item) => item.id !== notification.id),
  ]

  saveCustomerNotifications(next, userId)
}

export function markAllCustomerNotificationsRead(userId?: number | string | null) {
  const next = getCustomerNotifications(userId).map((item) => ({
    ...item,
    read: true,
  }))

  saveCustomerNotifications(next, userId)
}

export function markCustomerNotificationRead(
  notificationId: string,
  userId?: number | string | null
) {
  const next = getCustomerNotifications(userId).map((item) =>
    item.id === notificationId ? { ...item, read: true } : item
  )

  saveCustomerNotifications(next, userId)
}
