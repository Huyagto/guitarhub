"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  getHomeModeFromPathname,
  getModeFromPathname,
  getStoredManagerMode,
  managerModeConfigs,
  setStoredManagerMode,
  type ManagerMode,
} from "@/lib/admin-modes"
import { cn } from "@/lib/utils"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [activeMode, setActiveMode] = useState<ManagerMode>(() => getModeFromPathname(pathname))
  const modeConfig = managerModeConfigs[activeMode]

  useEffect(() => {
    const homeMode = getHomeModeFromPathname(pathname)
    if (homeMode) {
      setStoredManagerMode(homeMode)
      setActiveMode(homeMode)
      return
    }

    if (pathname === "/manager/settings") {
      const storedMode = getStoredManagerMode()
      if (storedMode) {
        setActiveMode(storedMode)
        return
      }
    }

    const mode = getModeFromPathname(pathname)
    setStoredManagerMode(mode)
    setActiveMode(mode)
  }, [pathname])

  return (
    <AuthGuard>
      <div className={cn("min-h-screen bg-background", activeMode === "staff" && "mode-staff", activeMode === "customer" && "mode-customer", activeMode === "reports" && "mode-reports")}>
        <div className={cn("pointer-events-none fixed inset-0 bg-gradient-to-br opacity-100", modeConfig.workspaceClassName)} />
        <div className="pointer-events-none fixed inset-y-0 left-0 w-80 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_45%)]" />
        <Sidebar />
        <div className="relative pl-64">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
