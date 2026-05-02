import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FolderTree,
  HeartHandshake,
  LineChart,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  UserCog,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react"

export type ManagerMode = "staff" | "customer" | "reports"

export interface ModeNavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface ModeQuickAction {
  name: string
  href: string
  description: string
}

export interface ModeNotification {
  title: string
  description: string
}

export interface ModeConfig {
  key: ManagerMode
  label: string
  shortLabel: string
  icon: LucideIcon
  title: string
  subtitle: string
  homeHref: string
  searchPlaceholder: string
  footerRole: string
  accentClassName: string
  workspaceClassName: string
  activeChipClassName: string
  inactiveChipClassName: string
  navigation: ModeNavigationItem[]
  topbarLinks: ModeNavigationItem[]
  quickActions: ModeQuickAction[]
  notifications: ModeNotification[]
}

const MANAGER_MODE_STORAGE_KEY = "manager_active_mode"

const staffNavigation: ModeNavigationItem[] = [
  { name: "Chi nhánh", href: "/manager/branches", icon: Building2 },
  { name: "Sản phẩm", href: "/manager/products", icon: Package },
  { name: "Danh mục", href: "/manager/categories", icon: FolderTree },
  { name: "Thương hiệu", href: "/manager/brands", icon: Tags },
  { name: "Kho hàng", href: "/manager/inventory", icon: Warehouse },
  { name: "Nhân viên", href: "/manager/staff", icon: Users },
  { name: "Cài đặt", href: "/manager/settings", icon: Settings },
]

const customerNavigation: ModeNavigationItem[] = [
  { name: "Đơn hàng", href: "/manager/orders", icon: ShoppingCart },
  { name: "Voucher", href: "/manager/vouchers", icon: Ticket },
  { name: "Cài đặt dịch vụ", href: "/manager/settings", icon: UserCog },
]

const reportsNavigation: ModeNavigationItem[] = [
  { name: "Tổng quan báo cáo", href: "/manager/reports", icon: BarChart3 },
  { name: "Đơn hàng", href: "/manager/reports/orders", icon: ShoppingCart },
  { name: "Khách hàng", href: "/manager/customers", icon: Users },
  { name: "Kho hàng", href: "/manager/inventory", icon: Warehouse },
]

export const managerModeConfigs: Record<ManagerMode, ModeConfig> = {
  staff: {
    key: "staff",
    label: "Staff Mode",
    shortLabel: "Staff",
    icon: BriefcaseBusiness,
    title: "Khu vận hành staff",
    subtitle: "Tập trung vào sản phẩm, kho và cấu hình vận hành cửa hàng.",
    homeHref: "/manager/products",
    searchPlaceholder: "Tìm sản phẩm, SKU, thương hiệu hoặc tồn kho...",
    footerRole: "Điều phối vận hành",
    accentClassName: "from-amber-500/20 via-orange-500/10 to-transparent",
    workspaceClassName: "from-amber-500/10 via-background to-background",
    activeChipClassName: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-amber-400/20 hover:text-foreground",
    navigation: staffNavigation,
    topbarLinks: staffNavigation.slice(0, 4),
    quickActions: [
      { name: "Thêm sản phẩm", href: "/manager/products", description: "Tạo sản phẩm mới cho kho." },
      { name: "Nhập thêm hàng", href: "/manager/inventory", description: "Cập nhật tồn kho cho staff." },
      { name: "Tạo danh mục", href: "/manager/categories", description: "Bổ sung danh mục vận hành." },
    ],
    notifications: [
      { title: "Kho sắp hết hàng", description: "Marshall JVM410H Head chỉ còn 3 sản phẩm." },
      { title: "Sản phẩm mới cần duyệt", description: "Có 4 sản phẩm nháp đang chờ staff hoàn tất." },
      { title: "Cập nhật thương hiệu", description: "Fender vừa được bổ sung 2 mẫu mới trong kho." },
    ],
  },
  customer: {
    key: "customer",
    label: "Customer Mode",
    shortLabel: "Customer",
    icon: HeartHandshake,
    title: "Khu chăm sóc khách hàng",
    subtitle: "Quản lý đơn hàng, voucher và cấu hình dịch vụ khách hàng.",
    homeHref: "/manager/orders",
    searchPlaceholder: "Tìm đơn hàng, voucher hoặc cấu hình dịch vụ...",
    footerRole: "Điều phối trải nghiệm",
    accentClassName: "from-sky-500/20 via-cyan-500/10 to-transparent",
    workspaceClassName: "from-sky-500/10 via-background to-background",
    activeChipClassName: "border-sky-400/30 bg-sky-500/15 text-sky-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-sky-400/20 hover:text-foreground",
    navigation: customerNavigation,
    topbarLinks: customerNavigation,
    quickActions: [
      { name: "Xem đơn hàng mới", href: "/manager/orders", description: "Ưu tiên xử lý đơn mới phát sinh." },
      { name: "Tạo ưu đãi", href: "/manager/vouchers", description: "Thiết lập mã giảm giá mới." },
    ],
    notifications: [
      { title: "Có đơn hàng mới", description: "Đơn #ORD-2024-001247 vừa được tạo." },
      { title: "Khách hàng mới đăng ký", description: "Amanda Garcia vừa tham gia cách đây 1 giờ." },
      { title: "Voucher sắp hết hạn", description: "SPRING2024 sẽ hết hạn trong 3 ngày nữa." },
    ],
  },
  reports: {
    key: "reports",
    label: "Reports Mode",
    shortLabel: "Reports",
    icon: LineChart,
    title: "Khu phân tích và báo cáo",
    subtitle: "Ưu tiên thống kê, xu hướng bán hàng và sức khỏe vận hành.",
    homeHref: "/manager/reports",
    searchPlaceholder: "Tìm báo cáo, chỉ số, nhóm khách hàng hoặc mốc thời gian...",
    footerRole: "Phân tích chiến lược",
    accentClassName: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    workspaceClassName: "from-violet-500/10 via-background to-background",
    activeChipClassName: "border-violet-400/30 bg-violet-500/15 text-violet-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-violet-400/20 hover:text-foreground",
    navigation: reportsNavigation,
    topbarLinks: reportsNavigation,
    quickActions: [
      { name: "Mở báo cáo doanh thu", href: "/manager/reports", description: "Xem tăng trưởng và hiệu suất bán hàng." },
      { name: "Phân tích đơn hàng", href: "/manager/reports/orders", description: "Đối chiếu online, tại cửa hàng và doanh thu." },
      { name: "Phân tích khách hàng", href: "/manager/customers", description: "Theo dõi hành vi và giá trị khách hàng." },
    ],
    notifications: [
      { title: "Doanh thu tăng trưởng tốt", description: "Doanh thu tháng này tăng 12.5% so với kỳ trước." },
      { title: "Giá trị đơn trung bình giảm", description: "AOV đang giảm 2.1%, cần theo dõi thêm." },
      { title: "Khách hàng quay lại tăng", description: "Tỷ lệ mua lại đang cải thiện trong nhóm VIP." },
    ],
  },
}

const routeModeMap: Array<{ mode: ManagerMode; paths: string[] }> = [
  { mode: "reports", paths: ["/manager", "/manager/reports", "/manager/customers"] },
  { mode: "customer", paths: ["/manager/orders", "/manager/vouchers"] },
  { mode: "staff", paths: ["/manager/branches", "/manager/products", "/manager/categories", "/manager/brands", "/manager/inventory", "/manager/settings"] },
]

export function getModeFromPathname(pathname: string): ManagerMode {
  const match = routeModeMap.find(({ paths }) =>
    paths.some((path) => pathname === path || (path !== "/manager" && pathname.startsWith(path)))
  )

  return match?.mode || "staff"
}

export function getModeConfigByPathname(pathname: string) {
  return managerModeConfigs[getModeFromPathname(pathname)]
}

export function getStoredManagerMode() {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(MANAGER_MODE_STORAGE_KEY)
  return raw && raw in managerModeConfigs ? (raw as ManagerMode) : null
}

export function setStoredManagerMode(mode: ManagerMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MANAGER_MODE_STORAGE_KEY, mode)
}

export function getHomeModeFromPathname(pathname: string) {
  const match = Object.values(managerModeConfigs).find((config) => config.homeHref === pathname)
  return match?.key || null
}
