"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Music2,
} from "lucide-react"
import { getStoredManagerUser } from "@/lib/auth"
import {
  getHomeModeFromPathname,
  getModeFromPathname,
  getStoredManagerMode,
  managerModeConfigs,
  setStoredManagerMode,
  type ManagerMode,
} from "@/lib/admin-modes"

export function Sidebar() {
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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Music2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Guitar Store</span>
          <span className="text-xs text-muted-foreground">Cổng quản trị</span>
        </div>
      </div>

      <div className="border-b border-sidebar-border px-4 py-4">
        <div className={cn("rounded-2xl border border-sidebar-border bg-gradient-to-br p-4", modeConfig.accentClassName)}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/60">
            <ModeIcon className="h-3.5 w-3.5" />
            {modeConfig.label}
          </div>
          <p className="mt-2 text-sm font-semibold text-sidebar-foreground">{modeConfig.title}</p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
            {modeConfig.subtitle}
          </p>

          <div className="mt-4 space-y-2">
            {modeOptions.map((mode) => {
              const option = managerModeConfigs[mode]
              const isActive = option.key === modeConfig.key

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setStoredManagerMode(option.key)
                    setActiveMode(option.key)
                    router.push(option.homeHref)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? modeConfig.activeChipClassName
                      : modeConfig.inactiveChipClassName
                  )}
                >
                  <span>{option.shortLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {modeConfig.navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/manager" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? cn("bg-sidebar-accent", modeConfig.activeChipClassName)
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-current")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-foreground">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">{userName}</span>
            <span className="text-xs text-muted-foreground">{modeConfig.footerRole}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
