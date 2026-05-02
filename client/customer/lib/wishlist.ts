"use client"

import type { Product } from "@/lib/types"

const WISHLIST_STORAGE_KEY = "guitarhub_wishlist"

export const WISHLIST_CHANGED_EVENT = "guitarhub:wishlist-changed"

function dispatchWishlistChanged() {
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT))
}

export function getWishlistItems(): Product[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    const items = JSON.parse(raw)
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function saveWishlistItems(items: Product[]) {
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  dispatchWishlistChanged()
}

export function isProductWishlisted(productId: string) {
  return getWishlistItems().some((item) => item.id === productId)
}

export function addWishlistItem(product: Product) {
  const items = getWishlistItems()
  if (items.some((item) => item.id === product.id)) return items

  const nextItems = [product, ...items]
  saveWishlistItems(nextItems)
  return nextItems
}

export function removeWishlistItem(productId: string) {
  const nextItems = getWishlistItems().filter((item) => item.id !== productId)
  saveWishlistItems(nextItems)
  return nextItems
}

export function toggleWishlistItem(product: Product) {
  return isProductWishlisted(product.id)
    ? removeWishlistItem(product.id)
    : addWishlistItem(product)
}
