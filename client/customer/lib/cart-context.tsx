"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { CartItem, Product } from "./types"
import {
  addCustomerCartItem,
  clearCustomerCart,
  getCustomerCart,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "./cart-api"
import { AUTH_SESSION_CHANGED_EVENT, getAccessToken } from "./auth"
import {
  addGuestCartItem,
  clearGuestCartItems,
  getGuestCartItems,
  removeGuestCartItem,
  updateGuestCartItem,
} from "./local-cart"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  subtotal: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const syncCart = useCallback(async () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      setItems(getGuestCartItems())
      setIsLoading(false)
      return
    }

    try {
      const guestItems = getGuestCartItems()

      if (guestItems.length > 0) {
        for (const item of guestItems) {
          await addCustomerCartItem(item.product.id, item.quantity)
        }

        clearGuestCartItems()
      }

      const cart = await getCustomerCart()
      setItems(cart?.items || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void syncCart()
  }, [syncCart])

  useEffect(() => {
    const handleAuthSessionChanged = () => {
      setIsLoading(true)
      void syncCart()
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged)
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged)
    }
  }, [syncCart])

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (!getAccessToken()) {
      const nextItems = addGuestCartItem(product, quantity)
      setItems(nextItems)
      return
    }

    const cart = await addCustomerCartItem(product.id, quantity)
    setItems(cart.items)
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    if (!getAccessToken()) {
      const nextItems = removeGuestCartItem(itemId)
      setItems(nextItems)
      return
    }

    const cart = await removeCustomerCartItem(itemId)
    setItems(cart.items)
  }, [])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    if (!getAccessToken()) {
      const nextItems = updateGuestCartItem(itemId, quantity)
      setItems(nextItems)
      return
    }

    const cart = await updateCustomerCartItem(itemId, quantity)
    setItems(cart.items)
  }, [])

  const clearCart = useCallback(async () => {
    if (!getAccessToken()) {
      clearGuestCartItems()
      setItems([])
      return
    }

    const cart = await clearCustomerCart()
    setItems(cart?.items || [])
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
