import type { CartItem, Product } from "@/lib/types"

const GUEST_CART_KEY = "customer_guest_cart"

function isBrowser() {
  return typeof window !== "undefined"
}

function persistGuestCart(items: CartItem[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function getGuestCartItems(): CartItem[] {
  if (!isBrowser()) return []

  const raw = window.localStorage.getItem(GUEST_CART_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

export function clearGuestCartItems() {
  if (!isBrowser()) return
  window.localStorage.removeItem(GUEST_CART_KEY)
}

export function addGuestCartItem(product: Product, quantity = 1) {
  const items = getGuestCartItems()
  const existingItem = items.find((item) => item.product.id === product.id)

  if (existingItem) {
    const nextItems = items.map((item) =>
      item.product.id === product.id
        ? {
            ...item,
            quantity: Math.min(item.quantity + quantity, product.stock || item.quantity + quantity),
          }
        : item
    )
    persistGuestCart(nextItems)
    return nextItems
  }

  const nextItems = [
    ...items,
    {
      id: `guest-${product.id}`,
      product,
      quantity: Math.min(quantity, product.stock || quantity),
      unitPrice: product.price,
    },
  ]

  persistGuestCart(nextItems)
  return nextItems
}

export function updateGuestCartItem(itemId: string, quantity: number) {
  const nextItems = getGuestCartItems()
    .map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: Math.min(quantity, item.product.stock || quantity),
          }
        : item
    )
    .filter((item) => item.quantity > 0)

  persistGuestCart(nextItems)
  return nextItems
}

export function removeGuestCartItem(itemId: string) {
  const nextItems = getGuestCartItems().filter((item) => item.id !== itemId)
  persistGuestCart(nextItems)
  return nextItems
}
