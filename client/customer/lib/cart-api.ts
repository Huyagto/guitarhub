import { apiRequest } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import type { CartItem, Product } from "@/lib/types"

interface ApiCartProduct {
  id: string
  name: string
  slug: string
  sku: string
  image?: string | null
  price: number
  stock: number
  category?: {
    id: string
    name: string
    slug: string
  } | null
  brand?: {
    id: string
    name: string
    slug: string
  } | null
}

interface ApiCartItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: ApiCartProduct | null
}

interface ApiCart {
  id: string
  userId: string
  items: ApiCartItem[]
  totalItems: number
  subtotal: number
}

function getAuthHeaders() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    return null
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

function mapCartProduct(product: ApiCartProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.category?.slug || "",
    categoryName: product.category?.name,
    brand: product.brand?.name || "",
    rating: 0,
    reviewCount: 0,
    images: [product.image || "/placeholder.svg?height=800&width=800"],
    description: "",
    shortDescription: "",
    specifications: {},
    stock: product.stock,
    tags: [],
    createdAt: new Date().toISOString(),
  }
}

function mapCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    product: item.product ? mapCartProduct(item.product) : mapCartProduct({
      id: item.productId,
      name: "Sản phẩm",
      slug: "",
      sku: "",
      price: item.unitPrice,
      stock: 0,
    }),
  }
}

function mapCart(cart: ApiCart) {
  return {
    ...cart,
    items: cart.items.map(mapCartItem),
  }
}

export async function getCustomerCart() {
  const headers = getAuthHeaders()
  if (!headers) return null

  const response = await apiRequest<ApiCart>("/api/cart", {
    headers,
    cache: "no-store",
  })
  return mapCart(response.metadata)
}

export async function addCustomerCartItem(productId: string, quantity: number) {
  const headers = getAuthHeaders()
  if (!headers) throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng")

  const response = await apiRequest<ApiCart>("/api/cart/items", {
    method: "POST",
    headers,
    body: JSON.stringify({ productId: Number(productId), quantity }),
  })

  return mapCart(response.metadata)
}

export async function updateCustomerCartItem(itemId: string, quantity: number) {
  const headers = getAuthHeaders()
  if (!headers) throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng")

  const response = await apiRequest<ApiCart>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ quantity }),
  })

  return mapCart(response.metadata)
}

export async function removeCustomerCartItem(itemId: string) {
  const headers = getAuthHeaders()
  if (!headers) throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng")

  const response = await apiRequest<ApiCart>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    headers,
  })

  return mapCart(response.metadata)
}

export async function clearCustomerCart() {
  const headers = getAuthHeaders()
  if (!headers) return null

  const response = await apiRequest<ApiCart>("/api/cart", {
    method: "DELETE",
    headers,
  })

  return mapCart(response.metadata)
}
