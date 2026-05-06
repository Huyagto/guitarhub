import { apiRequest } from "@/lib/api"
import { getManagerAccessToken } from "@/lib/auth"
import type { Branch, Brand, Category, Customer, InventoryItem, Order, Product, Staff, Voucher } from "@/lib/manager-types"

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
  orderChannels: {
    online: { orders: number; revenue: number }
    store: { orders: number; revenue: number }
  }
  categoryDistribution: Array<{ name: string; value: number; fill: string }>
  recentOrders: Order[]
  lowStockItems: InventoryItem[]
}

interface ReportsSummary extends DashboardOverview {
  monthlyData: Array<{
    month: string
    sales: number
    orders: number
    onlineOrders: number
    storeOrders: number
    onlineRevenue: number
    storeRevenue: number
    customers: number
    products: number
  }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  branchBreakdown: Array<{
    branchId: string
    branchName: string
    branchCode: string
    orders: number
    revenue: number
    onlineOrders: number
    storeOrders: number
  }>
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

export async function getReportsSummary(filters: { branchId?: string; startDate?: string; endDate?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.branchId && filters.branchId !== "all") params.set("branchId", filters.branchId)
  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  const query = params.toString()
  return managerRequest<ReportsSummary>(`/api/manager/reports/summary${query ? `?${query}` : ""}`)
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

export async function uploadManagerImage(file: string) {
  return managerRequest<{ url: string; publicId: string }>("/api/manager/uploads/image", {
    method: "POST",
    body: JSON.stringify({ file }),
  })
}

export async function uploadManagerProductImage(file: string) {
  return uploadManagerImage(file)
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

export async function getManagerInventoryByBranch(branchId?: string) {
  const query = branchId && branchId !== "all" ? `?branchId=${branchId}` : ""
  return managerRequest<InventoryItem[]>(`/api/manager/inventory${query}`)
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

export async function getManagerStaffs() {
  return managerRequest<Staff[]>("/api/manager/staffs")
}

export async function getManagerBranches() {
  return managerRequest<Branch[]>("/api/manager/branches")
}

export async function createManagerBranch(payload: Partial<Branch>) {
  return managerRequest<Branch>("/api/manager/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerBranch(id: string, payload: Partial<Branch>) {
  return managerRequest<Branch>(`/api/manager/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function createManagerStaff(payload: { fullName: string; email: string; phone?: string; password: string; branchId?: string }) {
  return managerRequest<Staff>("/api/manager/staffs", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateManagerStaff(id: string, payload: { fullName?: string; email?: string; phone?: string; isActive?: boolean; branchId?: string }) {
  return managerRequest<Staff>(`/api/manager/staffs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteManagerStaff(id: string) {
  return managerRequest<Staff>(`/api/manager/staffs/${id}`, { method: "DELETE" })
}

export async function regenerateManagerStaffCode(id: string) {
  return managerRequest<Staff>(`/api/manager/staffs/${id}/regenerate-code`, { method: "PATCH" })
}

export async function resetManagerStaffPassword(id: string, newPassword: string) {
  return managerRequest<Staff>(`/api/manager/staffs/${id}/reset-password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  })
}
