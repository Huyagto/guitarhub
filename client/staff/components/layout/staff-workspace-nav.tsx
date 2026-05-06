"use client"

import { useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, History, PackageSearch, Store, TimerOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface StaffWorkspaceNavProps {
  active: "pos" | "orders" | "history" | "inventory" | "shift"
  ordersBadgeCount?: number
}

const links = [
  {
    key: "pos" as const,
    href: "/pos",
    label: "POS",
    icon: Store,
  },
  {
    key: "orders" as const,
    href: "/orders",
    label: "Đơn hàng online",
    icon: ClipboardList,
  },
  {
    key: "history" as const,
    href: "/history",
    label: "Lịch sử đơn",
    icon: History,
  },
  {
    key: "inventory" as const,
    href: "/inventory",
    label: "Tồn kho",
    icon: PackageSearch,
  },
  {
    key: "shift" as const,
    href: "/shift",
    label: "Đóng ca",
    icon: TimerOff,
  },
]

export function StaffWorkspaceNav({ active, ordersBadgeCount = 0 }: StaffWorkspaceNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href))
  }, [router])

  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-muted/50 p-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = active === link.key || pathname === link.href
        const showBadge = link.key === "orders" && ordersBadgeCount > 0

        return (
          <button
            key={link.key}
            type="button"
            onMouseEnter={() => router.prefetch(link.href)}
            onFocus={() => router.prefetch(link.href)}
            onClick={() => {
              if (pathname === link.href) return
              startTransition(() => {
                router.push(link.href)
              })
            }}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
              isPending && !isActive ? "opacity-80" : ""
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden whitespace-nowrap xl:inline">{link.label}</span>
            {showBadge ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  isActive ? "bg-background/15 text-background" : "bg-destructive text-destructive-foreground"
                )}
              >
                {ordersBadgeCount > 99 ? "99+" : ordersBadgeCount}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
