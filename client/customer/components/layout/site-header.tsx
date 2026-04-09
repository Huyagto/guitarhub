"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Heart,
  LogOut,
  Package,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { clearAuthSession, getStoredUser } from "@/lib/auth"

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Cửa hàng", href: "/shop" },
  { name: "Acoustic", href: "/shop?category=acoustic-guitar" },
  { name: "Electric", href: "/shop?category=electric-guitar" },
  { name: "Bass", href: "/shop?category=bass-guitar" },
  { name: "Phụ kiện", href: "/shop?category=accessories" },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const { itemCount } = useCart()

  useEffect(() => {
    const user = getStoredUser()
    setIsAuthenticated(Boolean(user))
    setUserName(user?.fullName || "")
  }, [])

  const handleLogout = () => {
    clearAuthSession()
    setIsAuthenticated(false)
    setUserName("")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Guitar<span className="text-accent">Store</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Mở menu chính</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex lg:items-center lg:justify-end lg:gap-x-2">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 shadow-sm">
                <Input
                  type="search"
                  placeholder="Tìm kiếm đàn guitar..."
                  className="w-72 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Tìm kiếm</span>
              </Button>
            )}
          </div>

          {/* Wishlist */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Yêu thích</span>
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="sr-only">Giỏ hàng</span>
            </Link>
          </Button>

          {!isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" className="min-w-28 rounded-full" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" className="min-w-28 rounded-full" asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          ) : (
            <div className="max-w-40 truncate px-2 text-sm font-medium text-muted-foreground">
              Xin chào, {userName || "bạn"}
            </div>
          )}

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border border-transparent hover:border-border">
                <User className="h-5 w-5" />
                <span className="sr-only">Tài khoản</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tài khoản của tôi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Lịch sử đơn hàng
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden",
          mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
        )}
      >
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)} 
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Guitar<span className="text-accent">Store</span>
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Đóng menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Mobile search */}
          <div className="mt-6">
            <Input
              type="search"
              placeholder="Tìm kiếm đàn guitar..."
              className="w-full"
            />
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-2">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-3 px-3 pb-3">
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button className="rounded-full" asChild>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Đăng ký
                      </Link>
                    </Button>
                  </div>
                ) : null}
                <Link
                  href="/cart"
                  className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng
                  {itemCount > 0 && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/wishlist"
                  className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Yêu thích
                </Link>
                <Link
                  href={isAuthenticated ? "/profile" : "/login"}
                  className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  {isAuthenticated ? userName || "Tài khoản của tôi" : "Tài khoản của tôi"}
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="-mx-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-base font-semibold leading-7 text-foreground hover:bg-muted"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="h-5 w-5" />
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
