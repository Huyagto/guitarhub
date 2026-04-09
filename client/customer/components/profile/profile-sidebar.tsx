"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Lock, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { clearAuthSession, getStoredUser, type AuthUser } from "@/lib/auth"

const navigation = [
  { name: "Thông tin cá nhân", href: "/profile", icon: User },
  { name: "Lịch sử đơn hàng", href: "/profile/orders", icon: Package },
  { name: "Địa chỉ đã lưu", href: "/profile/addresses", icon: MapPin },
  { name: "Đổi mật khẩu", href: "/profile/password", icon: Lock },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const displayName = user?.fullName || "Khách hàng"
  const displayEmail = user?.email || "Chưa có email"
  const displayAvatar = user?.avatar || ""

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24">
        {/* User info */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={displayName}
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <span className="text-xl font-semibold text-muted-foreground">
                {displayName[0]}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                onClick={() => clearAuthSession()}
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
