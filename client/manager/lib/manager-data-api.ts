import { apiRequest } from "@/lib/api"
import { getManagerAccessToken } from "@/lib/auth"
import type { Brand, Category, Customer, InventoryItem, Order, Product, Voucher } from "@/lib/manager-types"

interface DashboardKpi {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalCustomers: number
  customersChange: number
  avgOrderValue: number
  avgOrderChange: number
}

interface DashboardOverview {
  kpi: DashboardKpi
  salesChartData: Array<{ month: string; sales: number; orders: number }>
  categoryDistribution: Array<{ name: string; value: number; fill: string }>
  recentOrders: Order[]
  lowStockItems: InventoryItem[]
}

interface ReportsSummary extends DashboardOverview {
  monthlyData: Array<{ month: string; sales: number; orders: number; customers: number; products: number }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
}

function getManagerHeaders() {
  const token = getManagerAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function managerRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const authHeaders = getManagerHeaders()

  Object.entries(authHeaders).forEach(([key, value]) => headers.set(key, value))

  return apiRequest<T>(path, {
    ...init,
    headers,
  })
}

export async function getDashboardOverview() {
  return managerRequest<DashboardOverview>("/api/manager/dashboard/overview")
}

export async function getReportsSummary() {
  return managerRequest<ReportsSummary>("/api/manager/reports/summary")
}

export async function getManagerProducts() {
  return managerRequest<Product[]>("/api/manager/products")
}

export async function createManagerProduct(payload: Partial<Product>) {
  return managerRequest<Product>("/api/manager/products", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerProduct(id: string, payload: Partial<Product>) {
  return managerRequest<Product>(`/api/manager/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteManagerProduct(id: string) {
  return managerRequest<Product>(`/api/manager/products/${id}`, { method: "DELETE" })
}

export async function uploadManagerProductImage(file: string) {
  return managerRequest<{ url: string; publicId: string }>("/api/manager/products/upload-image", {
    method: "POST",
    body: JSON.stringify({ file }),
  })
}

export async function getManagerCategories() {
  return managerRequest<Category[]>("/api/manager/categories")
}

export async function createManagerCategory(payload: Partial<Category>) {
  return managerRequest<Category>("/api/manager/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerCategory(id: string, payload: Partial<Category>) {
  return managerRequest<Category>(`/api/manager/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteManagerCategory(id: string) {
  return managerRequest<Category>(`/api/manager/categories/${id}`, { method: "DELETE" })
}

export async function getManagerBrands() {
  return managerRequest<Brand[]>("/api/manager/brands")
}

export async function createManagerBrand(payload: Partial<Brand>) {
  return managerRequest<Brand>("/api/manager/brands", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerBrand(id: string, payload: Partial<Brand>) {
  return managerRequest<Brand>(`/api/manager/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteManagerBrand(id: string) {
  return managerRequest<Brand>(`/api/manager/brands/${id}`, { method: "DELETE" })
}

export async function getManagerOrders() {
  return managerRequest<Order[]>("/api/manager/orders")
}

export async function updateManagerOrderStatus(id: string, status: Order["status"]) {
  return managerRequest<Order>(`/api/manager/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export async function getManagerCustomers() {
  return managerRequest<Customer[]>("/api/manager/customers")
}

export async function getManagerInventory() {
  return managerRequest<InventoryItem[]>("/api/manager/inventory")
}

export async function restockManagerInventory(id: string, quantity: number) {
  return managerRequest<InventoryItem>(`/api/manager/inventory/${id}/restock`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  })
}

export async function getManagerVouchers() {
  return managerRequest<Voucher[]>("/api/manager/vouchers")
}

export async function createManagerVoucher(payload: Partial<Voucher>) {
  return managerRequest<Voucher>("/api/manager/vouchers", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerVoucher(id: string, payload: Partial<Voucher>) {
  return managerRequest<Voucher>(`/api/manager/vouchers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteManagerVoucher(id: string) {
  return managerRequest<Voucher>(`/api/manager/vouchers/${id}`, { method: "DELETE" })
}
