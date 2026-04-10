// Mock data for Guitar Store Manager Dashboard

export interface Product {
  id: string
  name: string
  slug?: string
  sku: string
  categoryId?: string
  category: string
  brandId?: string
  brand: string
  price: number
  stock: number
  status: "active" | "draft" | "archived"
  image: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  productCount: number
  status: "active" | "inactive"
}

export interface Brand {
  id: string
  name: string
  logo: string
  productCount: number
  status: "active" | "inactive"
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "paid" | "pending" | "refunded"
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive"
  joinedAt: string
}

export interface InventoryItem {
  id: string
  productId: string
  productName: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastRestocked: string
}

export interface Voucher {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase: number
  usageLimit: number
  usedCount: number
  status: "active" | "expired" | "disabled"
  expiresAt: string
}

// KPI Data
export const kpiData = {
  totalRevenue: 284750,
  revenueChange: 12.5,
  totalOrders: 1247,
  ordersChange: 8.2,
  totalCustomers: 3842,
  customersChange: 15.3,
  avgOrderValue: 228.35,
  avgOrderChange: -2.1,
}

// Sales Chart Data
export const salesChartData = [
  { month: "Jan", sales: 18500, orders: 89 },
  { month: "Feb", sales: 22300, orders: 112 },
  { month: "Mar", sales: 19800, orders: 98 },
  { month: "Apr", sales: 28400, orders: 142 },
  { month: "May", sales: 31200, orders: 156 },
  { month: "Jun", sales: 26800, orders: 134 },
  { month: "Jul", sales: 34500, orders: 172 },
  { month: "Aug", sales: 29700, orders: 148 },
  { month: "Sep", sales: 27300, orders: 136 },
  { month: "Oct", sales: 32100, orders: 160 },
  { month: "Nov", sales: 38900, orders: 194 },
  { month: "Dec", sales: 42600, orders: 213 },
]

// Category Distribution
export const categoryDistribution = [
  { name: "Electric Guitars", value: 35, fill: "var(--chart-1)" },
  { name: "Acoustic Guitars", value: 28, fill: "var(--chart-2)" },
  { name: "Bass Guitars", value: 15, fill: "var(--chart-3)" },
  { name: "Amplifiers", value: 12, fill: "var(--chart-4)" },
  { name: "Accessories", value: 10, fill: "var(--chart-5)" },
]

// Products
export const products: Product[] = [
  {
    id: "1",
    name: "Fender Stratocaster American Pro II",
    sku: "FEN-STRAT-AP2-BLK",
    category: "Electric Guitars",
    brand: "Fender",
    price: 1799.99,
    stock: 12,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Gibson Les Paul Standard 50s",
    sku: "GIB-LP-STD50-HB",
    category: "Electric Guitars",
    brand: "Gibson",
    price: 2499.99,
    stock: 8,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    name: "Taylor 814ce Builder's Edition",
    sku: "TAY-814CE-BE",
    category: "Acoustic Guitars",
    brand: "Taylor",
    price: 3999.99,
    stock: 4,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    name: "Martin D-28 Standard",
    sku: "MAR-D28-STD",
    category: "Acoustic Guitars",
    brand: "Martin",
    price: 3299.99,
    stock: 6,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-08",
  },
  {
    id: "5",
    name: "Fender Jazz Bass American Ultra",
    sku: "FEN-JB-ULTRA-SB",
    category: "Bass Guitars",
    brand: "Fender",
    price: 2199.99,
    stock: 5,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    name: "Marshall JVM410H Head",
    sku: "MAR-JVM410H",
    category: "Amplifiers",
    brand: "Marshall",
    price: 1999.99,
    stock: 3,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-03",
  },
  {
    id: "7",
    name: "PRS Custom 24-08",
    sku: "PRS-C24-08-EM",
    category: "Electric Guitars",
    brand: "PRS",
    price: 4299.99,
    stock: 2,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-01-01",
  },
  {
    id: "8",
    name: "Ibanez RG550 Genesis",
    sku: "IBN-RG550-GEN",
    category: "Electric Guitars",
    brand: "Ibanez",
    price: 999.99,
    stock: 15,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2023-12-28",
  },
  {
    id: "9",
    name: "Boss Katana-100 MkII",
    sku: "BOSS-KAT100-MK2",
    category: "Amplifiers",
    brand: "Boss",
    price: 399.99,
    stock: 0,
    status: "draft",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2023-12-25",
  },
  {
    id: "10",
    name: "Ernie Ball Music Man StingRay",
    sku: "EBMM-SRAY-BLK",
    category: "Bass Guitars",
    brand: "Ernie Ball",
    price: 2399.99,
    stock: 4,
    status: "active",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2023-12-20",
  },
]

// Categories
export const categories: Category[] = [
  { id: "1", name: "Electric Guitars", description: "Solid body and semi-hollow electric guitars", productCount: 45, status: "active" },
  { id: "2", name: "Acoustic Guitars", description: "Steel-string and classical acoustic guitars", productCount: 32, status: "active" },
  { id: "3", name: "Bass Guitars", description: "Electric and acoustic bass guitars", productCount: 18, status: "active" },
  { id: "4", name: "Amplifiers", description: "Guitar and bass amplifiers, combos and heads", productCount: 24, status: "active" },
  { id: "5", name: "Effects Pedals", description: "Stompboxes, multi-effects, and pedalboards", productCount: 56, status: "active" },
  { id: "6", name: "Accessories", description: "Strings, picks, straps, cases, and more", productCount: 128, status: "active" },
  { id: "7", name: "Recording Equipment", description: "Audio interfaces, microphones, and monitors", productCount: 15, status: "inactive" },
]

// Brands
export const brands: Brand[] = [
  { id: "1", name: "Fender", logo: "/placeholder.svg?height=40&width=40", productCount: 38, status: "active" },
  { id: "2", name: "Gibson", logo: "/placeholder.svg?height=40&width=40", productCount: 28, status: "active" },
  { id: "3", name: "Taylor", logo: "/placeholder.svg?height=40&width=40", productCount: 22, status: "active" },
  { id: "4", name: "Martin", logo: "/placeholder.svg?height=40&width=40", productCount: 18, status: "active" },
  { id: "5", name: "PRS", logo: "/placeholder.svg?height=40&width=40", productCount: 15, status: "active" },
  { id: "6", name: "Ibanez", logo: "/placeholder.svg?height=40&width=40", productCount: 32, status: "active" },
  { id: "7", name: "Marshall", logo: "/placeholder.svg?height=40&width=40", productCount: 12, status: "active" },
  { id: "8", name: "Boss", logo: "/placeholder.svg?height=40&width=40", productCount: 45, status: "active" },
  { id: "9", name: "Ernie Ball", logo: "/placeholder.svg?height=40&width=40", productCount: 8, status: "active" },
]

// Orders
export const orders: Order[] = [
  { id: "1", orderNumber: "ORD-2024-001247", customer: "John Smith", email: "john.smith@email.com", items: 3, total: 2847.97, status: "delivered", paymentStatus: "paid", createdAt: "2024-03-15T10:30:00" },
  { id: "2", orderNumber: "ORD-2024-001246", customer: "Sarah Johnson", email: "sarah.j@email.com", items: 1, total: 1799.99, status: "shipped", paymentStatus: "paid", createdAt: "2024-03-14T15:45:00" },
  { id: "3", orderNumber: "ORD-2024-001245", customer: "Mike Williams", email: "mike.w@email.com", items: 5, total: 456.45, status: "processing", paymentStatus: "paid", createdAt: "2024-03-14T09:20:00" },
  { id: "4", orderNumber: "ORD-2024-001244", customer: "Emily Davis", email: "emily.d@email.com", items: 2, total: 3499.98, status: "pending", paymentStatus: "pending", createdAt: "2024-03-13T16:10:00" },
  { id: "5", orderNumber: "ORD-2024-001243", customer: "David Brown", email: "david.b@email.com", items: 1, total: 2499.99, status: "delivered", paymentStatus: "paid", createdAt: "2024-03-13T11:05:00" },
  { id: "6", orderNumber: "ORD-2024-001242", customer: "Lisa Anderson", email: "lisa.a@email.com", items: 4, total: 892.50, status: "cancelled", paymentStatus: "refunded", createdAt: "2024-03-12T14:30:00" },
  { id: "7", orderNumber: "ORD-2024-001241", customer: "James Wilson", email: "james.w@email.com", items: 2, total: 4199.98, status: "delivered", paymentStatus: "paid", createdAt: "2024-03-12T09:15:00" },
  { id: "8", orderNumber: "ORD-2024-001240", customer: "Jennifer Taylor", email: "jen.t@email.com", items: 1, total: 999.99, status: "shipped", paymentStatus: "paid", createdAt: "2024-03-11T17:45:00" },
  { id: "9", orderNumber: "ORD-2024-001239", customer: "Robert Martinez", email: "rob.m@email.com", items: 3, total: 1547.97, status: "processing", paymentStatus: "paid", createdAt: "2024-03-11T12:20:00" },
  { id: "10", orderNumber: "ORD-2024-001238", customer: "Amanda Garcia", email: "amanda.g@email.com", items: 2, total: 2699.98, status: "delivered", paymentStatus: "paid", createdAt: "2024-03-10T10:00:00" },
]

// Customers
export const customers: Customer[] = [
  { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "+1 (555) 123-4567", totalOrders: 12, totalSpent: 15847.50, status: "active", joinedAt: "2022-06-15" },
  { id: "2", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 (555) 234-5678", totalOrders: 8, totalSpent: 9245.80, status: "active", joinedAt: "2022-08-22" },
  { id: "3", name: "Mike Williams", email: "mike.w@email.com", phone: "+1 (555) 345-6789", totalOrders: 23, totalSpent: 28450.25, status: "active", joinedAt: "2021-11-03" },
  { id: "4", name: "Emily Davis", email: "emily.d@email.com", phone: "+1 (555) 456-7890", totalOrders: 5, totalSpent: 6899.95, status: "active", joinedAt: "2023-02-14" },
  { id: "5", name: "David Brown", email: "david.b@email.com", phone: "+1 (555) 567-8901", totalOrders: 15, totalSpent: 18750.00, status: "active", joinedAt: "2022-01-28" },
  { id: "6", name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+1 (555) 678-9012", totalOrders: 3, totalSpent: 2547.50, status: "inactive", joinedAt: "2023-07-10" },
  { id: "7", name: "James Wilson", email: "james.w@email.com", phone: "+1 (555) 789-0123", totalOrders: 31, totalSpent: 42890.75, status: "active", joinedAt: "2020-09-05" },
  { id: "8", name: "Jennifer Taylor", email: "jen.t@email.com", phone: "+1 (555) 890-1234", totalOrders: 7, totalSpent: 5640.30, status: "active", joinedAt: "2023-04-18" },
]

// Inventory
export const inventory: InventoryItem[] = [
  { id: "1", productId: "1", productName: "Fender Stratocaster American Pro II", sku: "FEN-STRAT-AP2-BLK", currentStock: 12, minStock: 5, maxStock: 25, status: "in-stock", lastRestocked: "2024-03-10" },
  { id: "2", productId: "2", productName: "Gibson Les Paul Standard 50s", sku: "GIB-LP-STD50-HB", currentStock: 8, minStock: 3, maxStock: 15, status: "in-stock", lastRestocked: "2024-03-08" },
  { id: "3", productId: "3", productName: "Taylor 814ce Builder's Edition", sku: "TAY-814CE-BE", currentStock: 4, minStock: 2, maxStock: 10, status: "in-stock", lastRestocked: "2024-03-05" },
  { id: "4", productId: "6", productName: "Marshall JVM410H Head", sku: "MAR-JVM410H", currentStock: 3, minStock: 5, maxStock: 12, status: "low-stock", lastRestocked: "2024-02-28" },
  { id: "5", productId: "7", productName: "PRS Custom 24-08", sku: "PRS-C24-08-EM", currentStock: 2, minStock: 3, maxStock: 8, status: "low-stock", lastRestocked: "2024-02-25" },
  { id: "6", productId: "9", productName: "Boss Katana-100 MkII", sku: "BOSS-KAT100-MK2", currentStock: 0, minStock: 8, maxStock: 20, status: "out-of-stock", lastRestocked: "2024-02-15" },
  { id: "7", productId: "8", productName: "Ibanez RG550 Genesis", sku: "IBN-RG550-GEN", currentStock: 15, minStock: 10, maxStock: 30, status: "in-stock", lastRestocked: "2024-03-12" },
  { id: "8", productId: "5", productName: "Fender Jazz Bass American Ultra", sku: "FEN-JB-ULTRA-SB", currentStock: 5, minStock: 4, maxStock: 12, status: "in-stock", lastRestocked: "2024-03-01" },
]

// Vouchers
export const vouchers: Voucher[] = [
  { id: "1", code: "SPRING2024", type: "percentage", value: 15, minPurchase: 100, usageLimit: 500, usedCount: 234, status: "active", expiresAt: "2024-04-30" },
  { id: "2", code: "GUITAR20", type: "percentage", value: 20, minPurchase: 500, usageLimit: 200, usedCount: 156, status: "active", expiresAt: "2024-05-15" },
  { id: "3", code: "NEWCUSTOMER", type: "fixed", value: 50, minPurchase: 200, usageLimit: 1000, usedCount: 892, status: "active", expiresAt: "2024-12-31" },
  { id: "4", code: "VIP100", type: "fixed", value: 100, minPurchase: 1000, usageLimit: 50, usedCount: 50, status: "expired", expiresAt: "2024-02-28" },
  { id: "5", code: "HOLIDAY25", type: "percentage", value: 25, minPurchase: 300, usageLimit: 300, usedCount: 298, status: "disabled", expiresAt: "2024-01-15" },
  { id: "6", code: "BUNDLE10", type: "percentage", value: 10, minPurchase: 150, usageLimit: 0, usedCount: 1247, status: "active", expiresAt: "2024-06-30" },
]

// Recent Activity
export const recentActivity = [
  { id: "1", type: "order", message: "New order #ORD-2024-001247 received", time: "2 minutes ago" },
  { id: "2", type: "inventory", message: "Low stock alert: Marshall JVM410H Head", time: "15 minutes ago" },
  { id: "3", type: "customer", message: "New customer registered: Amanda Garcia", time: "1 hour ago" },
  { id: "4", type: "order", message: "Order #ORD-2024-001245 shipped", time: "2 hours ago" },
  { id: "5", type: "product", message: "Product updated: Fender Stratocaster", time: "3 hours ago" },
]
