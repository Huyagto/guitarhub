import { apiRequest } from "@/lib/api"
import { getStaffAccessToken } from "@/lib/auth"
import type { PaymentMethod, Product } from "@/lib/pos-data"

function staffRequest<T>(path: string, init: RequestInit = {}) {
  const token = getStaffAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return apiRequest<T>(path, { ...init, headers })
}

interface StaffCategoryResponse {
  id: string
  name: string
  slug: string
  status: string
}

interface StaffProductResponse {
  id: string
  name: string
  sku: string
  categorySlug: string | null
  category: string | null
  price: number
  stock: number
  image: string | null
  status: string
}

interface PosCategory {
  id: string
  name: string
}

interface PosCatalog {
  categories: PosCategory[]
  products: Product[]
}

export async function getPosCatalog() {
  const token = getStaffAccessToken()
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const [categoriesResponse, productsResponse] = await Promise.all([
    apiRequest<StaffCategoryResponse[]>("/api/staff/categories", { headers }),
    apiRequest<StaffProductResponse[]>("/api/staff/products", { headers }),
  ])

  const categories: PosCategory[] = [
    { id: "all", name: "Tất cả sản phẩm" },
    ...categoriesResponse.metadata
      .filter((category) => category.status === "active")
      .map((category) => ({
        id: category.slug,
        name: category.name,
      })),
  ]

  const products: Product[] = productsResponse.metadata
    .filter((product) => product.status === "active")
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.categorySlug || "uncategorized",
      image: product.image || "/placeholder.svg",
      stock: product.stock,
      sku: product.sku,
    }))

  return {
    message: "Lấy danh mục POS thành công",
    metadata: {
      categories,
      products,
    } satisfies PosCatalog,
  }
}

export interface PosOrderItem {
  productId: string
  quantity: number
}

export interface CreatePosOrderPayload {
  customerName?: string
  customerPhone?: string
  note?: string
  paymentMethod: PaymentMethod
  voucherCode?: string
  items: PosOrderItem[]
}

export interface PosOrderResult {
  id: string
  orderNumber: string
}

export async function createPosOrder(payload: CreatePosOrderPayload) {
  return staffRequest<PosOrderResult>("/api/staff/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export interface VoucherValidateResult {
  code: string
  type: string
  value: number
  discountAmount: number
}

export async function validatePosVoucher(code: string, subtotal: number) {
  return staffRequest<VoucherValidateResult>("/api/staff/pos/vouchers/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  })
}
