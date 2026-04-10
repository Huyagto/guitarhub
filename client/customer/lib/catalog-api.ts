import { apiRequest } from "@/lib/api"
import type { BrandInfo, CategoryInfo, Product } from "@/lib/types"

interface ApiCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  productCount: number
}

interface ApiBrand {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  productCount: number
}

interface ApiProduct {
  id: string
  name: string
  slug: string
  price: number
  category: string
  categoryName?: string | null
  brand: string
  rating: number
  reviewCount: number
  images: string[]
  description: string
  shortDescription: string
  specifications: Record<string, string>
  stock: number
  tags: string[]
  isBestSeller?: boolean
  isNewArrival?: boolean
  createdAt: string
}

function mapCategory(category: ApiCategory): CategoryInfo {
  return {
    id: category.slug,
    name: category.name,
    description: category.description || "",
    image: category.image || "/placeholder.svg?height=600&width=800",
    productCount: category.productCount || 0,
  }
}

function mapBrand(brand: ApiBrand): BrandInfo {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    description: brand.description,
    productCount: brand.productCount,
  }
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.category,
    categoryName: product.categoryName || undefined,
    brand: product.brand,
    rating: product.rating,
    reviewCount: product.reviewCount,
    images: product.images?.length ? product.images : ["/placeholder.svg?height=800&width=800"],
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    specifications: product.specifications || {},
    stock: product.stock,
    tags: product.tags || [],
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    createdAt: product.createdAt,
  }
}

export async function getCatalogCategories() {
  const response = await apiRequest<ApiCategory[]>("/api/categories", { cache: "no-store" })
  return response.metadata.map(mapCategory)
}

export async function getCatalogBrands() {
  const response = await apiRequest<ApiBrand[]>("/api/brands", { cache: "no-store" })
  return response.metadata.map(mapBrand)
}

export async function getCatalogProducts(params?: { search?: string; category?: string; brand?: string }) {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.category) query.set("category", params.category)
  if (params?.brand) query.set("brand", params.brand)

  const suffix = query.toString() ? `?${query.toString()}` : ""
  const response = await apiRequest<ApiProduct[]>(`/api/products${suffix}`, { cache: "no-store" })
  return response.metadata.map(mapProduct)
}

export async function getBestSellerProducts() {
  const response = await apiRequest<ApiProduct[]>("/api/products/best-sellers", { cache: "no-store" })
  return response.metadata.map(mapProduct)
}

export async function getNewArrivalProducts() {
  const response = await apiRequest<ApiProduct[]>("/api/products/new-arrivals", { cache: "no-store" })
  return response.metadata.map(mapProduct)
}

export async function getCatalogProductBySlug(slug: string) {
  const response = await apiRequest<ApiProduct>(`/api/products/${slug}`, { cache: "no-store" })
  return mapProduct(response.metadata)
}

export async function getRelatedCatalogProducts(slug: string) {
  const response = await apiRequest<ApiProduct[]>(`/api/products/${slug}/related`, { cache: "no-store" })
  return response.metadata.map(mapProduct)
}
