import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FolderTree,
  HeartHandshake,
  LineChart,
  MapPinHouse,
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

export type ManagerMode = "staff" | "branches" | "customer" | "reports" | "settings"

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
  { name: "Sản phẩm", href: "/manager/products", icon: Package },
  { name: "Danh mục", href: "/manager/categories", icon: FolderTree },
  { name: "Thương hiệu", href: "/manager/brands", icon: Tags },
  { name: "Nhân viên", href: "/manager/staff", icon: Users },
]

const branchesNavigation: ModeNavigationItem[] = [
  { name: "Địa chỉ cửa hàng", href: "/manager/branches", icon: MapPinHouse },
  { name: "Sản phẩm theo chi nhánh", href: "/manager/products", icon: Package },
  { name: "Kho từng chi nhánh", href: "/manager/inventory", icon: Warehouse },
  { name: "Báo cáo chi nhánh", href: "/manager/branch-reports", icon: BarChart3 },
]

const customerNavigation: ModeNavigationItem[] = [
  { name: "Đơn hàng", href: "/manager/orders", icon: ShoppingCart },
  { name: "Voucher", href: "/manager/vouchers", icon: Ticket },
]

const reportsNavigation: ModeNavigationItem[] = [
  { name: "Tổng quan báo cáo", href: "/manager/reports", icon: BarChart3 },
  { name: "Đơn hàng", href: "/manager/reports/orders", icon: ShoppingCart },
  { name: "Khách hàng", href: "/manager/customers", icon: Users },
]

const settingsNavigation: ModeNavigationItem[] = [
  { name: "Cài đặt hệ thống", href: "/manager/settings", icon: Settings },
]

export const managerModeConfigs: Record<ManagerMode, ModeConfig> = {
  staff: {
    key: "staff",
    label: "Staff Mode",
    shortLabel: "Staff",
    icon: BriefcaseBusiness,
    title: "Khu vận hành staff",
    subtitle: "Quản lý sản phẩm, danh mục, thương hiệu và nhân viên.",
    homeHref: "/manager/products",
    searchPlaceholder: "Tìm sản phẩm, SKU, thương hiệu hoặc nhân viên...",
    footerRole: "Điều phối vận hành",
    accentClassName: "from-amber-500/20 via-orange-500/10 to-transparent",
    workspaceClassName: "from-amber-500/10 via-background to-background",
    activeChipClassName: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-amber-400/20 hover:text-foreground",
    navigation: staffNavigation,
    topbarLinks: staffNavigation.slice(0, 4),
    quickActions: [
      { name: "Thêm sản phẩm", href: "/manager/products", description: "Tạo sản phẩm mới và gán tồn theo chi nhánh." },
      { name: "Tạo danh mục", href: "/manager/categories", description: "Bổ sung danh mục vận hành." },
      { name: "Thêm nhân viên", href: "/manager/staff", description: "Tạo tài khoản staff và gán chi nhánh." },
    ],
    notifications: [
      { title: "Sản phẩm theo chi nhánh", description: "Khi thêm sản phẩm, hãy gán tồn kho cho từng địa chỉ cửa hàng." },
      { title: "Nhân viên cần chi nhánh", description: "Staff phải được gán chi nhánh trước khi bán POS." },
      { title: "Danh mục đang hoạt động", description: "Danh mục và thương hiệu vẫn được quản lý tập trung." },
    ],
  },
  branches: {
    key: "branches",
    label: "Branch Mode",
    shortLabel: "Chi nhánh",
    icon: Building2,
    title: "Khu quản lý chi nhánh",
    subtitle: "Mỗi địa chỉ cửa hàng là một chi nhánh, có nhân viên, kho và báo cáo riêng.",
    homeHref: "/manager/branches",
    searchPlaceholder: "Tìm chi nhánh, địa chỉ, kho hoặc báo cáo chi nhánh...",
    footerRole: "Quản lý chi nhánh",
    accentClassName: "from-emerald-500/20 via-teal-500/10 to-transparent",
    workspaceClassName: "from-emerald-500/10 via-background to-background",
    activeChipClassName: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-emerald-400/20 hover:text-foreground",
    navigation: branchesNavigation,
    topbarLinks: branchesNavigation,
    quickActions: [
      { name: "Thêm chi nhánh", href: "/manager/branches", description: "Tạo địa chỉ cửa hàng mới và kho riêng." },
      { name: "Xem kho chi nhánh", href: "/manager/inventory", description: "Lọc tồn kho theo từng chi nhánh hoặc xem tổng." },
      { name: "Báo cáo chi nhánh", href: "/manager/branch-reports", description: "So sánh doanh thu, đơn hàng và hiệu suất theo chi nhánh." },
    ],
    notifications: [
      { title: "Kho tách theo địa chỉ", description: "Mỗi chi nhánh có tồn kho riêng trong branch_inventory." },
      { title: "Online cần chọn chi nhánh", description: "Khách mua online phải chọn chi nhánh còn đủ hàng." },
      { title: "POS theo staff", description: "Staff bán hàng sẽ trừ kho của chi nhánh được gán." },
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
      { title: "Có đơn hàng mới", description: "Theo dõi và xử lý đơn trong khu Customer." },
      { title: "Voucher sắp hết hạn", description: "Kiểm tra các mã giảm giá gần đến hạn." },
      { title: "Đơn online theo chi nhánh", description: "Chi nhánh xử lý đơn được lưu trực tiếp trên đơn hàng." },
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
      { title: "Báo cáo tổng quan", description: "Dashboard báo cáo nằm riêng trong Reports Mode." },
      { title: "Lọc theo thời gian", description: "Các báo cáo hỗ trợ khoảng ngày bắt đầu và kết thúc." },
      { title: "Lọc theo chi nhánh", description: "Báo cáo chi nhánh chuyên sâu nằm trong Branch Mode." },
    ],
  },
  settings: {
    key: "settings",
    label: "Settings Mode",
    shortLabel: "Cài đặt",
    icon: Settings,
    title: "Khu cài đặt hệ thống",
    subtitle: "Quản lý cấu hình chung, tài khoản và các thiết lập nền của hệ thống.",
    homeHref: "/manager/settings",
    searchPlaceholder: "Tìm cấu hình, tài khoản hoặc thiết lập hệ thống...",
    footerRole: "Quản trị hệ thống",
    accentClassName: "from-slate-500/20 via-zinc-500/10 to-transparent",
    workspaceClassName: "from-zinc-500/10 via-background to-background",
    activeChipClassName: "border-zinc-400/30 bg-zinc-500/15 text-zinc-200",
    inactiveChipClassName: "border-border bg-background text-muted-foreground hover:border-zinc-400/20 hover:text-foreground",
    navigation: settingsNavigation,
    topbarLinks: settingsNavigation,
    quickActions: [
      { name: "Mở cài đặt", href: "/manager/settings", description: "Đi tới cấu hình chung của hệ thống." },
    ],
    notifications: [
      { title: "Cài đặt đã tách riêng", description: "Settings không còn nằm trong Staff, Customer hay Reports." },
      { title: "Cấu hình chung", description: "Các thiết lập hệ thống nên được quản lý tập trung tại đây." },
      { title: "Kiểm tra quyền truy cập", description: "Chỉ manager được truy cập khu cài đặt hệ thống." },
    ],
  },
}

const routeModeMap: Array<{ mode: ManagerMode; paths: string[] }> = [
  { mode: "settings", paths: ["/manager/settings"] },
  { mode: "branches", paths: ["/manager/branches", "/manager/inventory", "/manager/branch-reports"] },
  { mode: "reports", paths: ["/manager", "/manager/reports", "/manager/customers"] },
  { mode: "customer", paths: ["/manager/orders", "/manager/vouchers"] },
  { mode: "staff", paths: ["/manager/products", "/manager/categories", "/manager/brands", "/manager/staff"] },
]

export const managerModeOrder: ManagerMode[] = ["staff", "branches", "customer", "reports", "settings"]

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
