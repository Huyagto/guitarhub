"use client"

import { useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ClipboardList, Store } from "lucide-react"
import { cn } from "@/lib/utils"

interface StaffWorkspaceNavProps {
  active: "pos" | "orders"
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
]

export function StaffWorkspaceNav({ active, ordersBadgeCount = 0 }: StaffWorkspaceNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    router.prefetch("/pos")
    router.prefetch("/orders")
  }, [router])

  return (
    <div className="inline-flex rounded-2xl border border-border bg-muted/50 p-1">
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
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
              isPending && !isActive ? "opacity-80" : ""
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
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
