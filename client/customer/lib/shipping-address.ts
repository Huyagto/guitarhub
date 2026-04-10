import type { Address } from "@/lib/types"

const DEFAULT_SHIPPING_ADDRESS_KEY = "customer_default_shipping_address"

export interface StoredShippingAddress extends Address {
  displayName: string
  lat?: string
  lon?: string
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function getDefaultShippingAddress() {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(DEFAULT_SHIPPING_ADDRESS_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredShippingAddress
  } catch {
    return null
  }
}

export function saveDefaultShippingAddress(address: StoredShippingAddress) {
  if (!isBrowser()) return
  window.localStorage.setItem(DEFAULT_SHIPPING_ADDRESS_KEY, JSON.stringify(address))
}

export function clearDefaultShippingAddress() {
  if (!isBrowser()) return
  window.localStorage.removeItem(DEFAULT_SHIPPING_ADDRESS_KEY)
}
