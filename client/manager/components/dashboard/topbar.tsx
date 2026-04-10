"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Search, ChevronDown, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearManagerSession, getStoredManagerUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
  getHomeModeFromPathname,
  getModeFromPathname,
  getStoredManagerMode,
  managerModeConfigs,
  setStoredManagerMode,
  type ManagerMode,
} from "@/lib/admin-modes"

interface TopbarProps {
  title: string
  description?: string
}

export function Topbar({ title, description }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState("Quản lý")
  const [activeMode, setActiveMode] = useState<ManagerMode>(() => getStoredManagerMode() || getModeFromPathname(pathname))
  const modeConfig = managerModeConfigs[activeMode]
  const modeOptions: ManagerMode[] = ["staff", "customer", "reports"]
  const ModeIcon = modeConfig.icon

  useEffect(() => {
    const user = getStoredManagerUser()
    if (user?.fullName) {
      setUserName(user.fullName)
    }
  }, [])

  useEffect(() => {
    const homeMode = getHomeModeFromPathname(pathname)
    if (homeMode) {
      setStoredManagerMode(homeMode)
      setActiveMode(homeMode)
      return
    }

    const storedMode = getStoredManagerMode()
    if (storedMode) {
      setActiveMode(storedMode)
      return
    }

    setActiveMode(getModeFromPathname(pathname))
  }, [pathname])

  const handleLogout = () => {
    clearManagerSession()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div>
            <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", modeConfig.activeChipClassName)}>
              <ModeIcon className="h-3.5 w-3.5" />
              {modeConfig.label}
            </div>
            <h1 className="mt-2 text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {modeConfig.topbarLinks.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/manager" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? modeConfig.activeChipClassName
                      : modeConfig.inactiveChipClassName
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ModeIcon className="h-4 w-4" />
                  Chuyển mode
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Khu quản trị</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {modeOptions.map((mode) => {
                  const option = managerModeConfigs[mode]
                  return (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => {
                        setStoredManagerMode(option.key)
                        setActiveMode(option.key)
                        router.push(option.homeHref)
                      }}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.subtitle}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Tác vụ nhanh
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Tác vụ trong {modeConfig.shortLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {modeConfig.quickActions.map((action) => (
                  <DropdownMenuItem key={action.name} asChild>
                    <Link href={action.href} className="flex flex-col items-start gap-1">
                      <span className="font-medium">{action.name}</span>
                      <span className="text-xs text-muted-foreground">{action.description}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={modeConfig.searchPlaceholder}
                className="w-72 bg-secondary pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Thông báo của {modeConfig.shortLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {modeConfig.notifications.map((notification) => (
                  <DropdownMenuItem key={notification.title} className="flex flex-col items-start gap-1">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium md:inline-block">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
                <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
