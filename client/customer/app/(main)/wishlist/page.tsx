"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { getWishlistItems, removeWishlistItem, WISHLIST_CHANGED_EVENT } from "@/lib/wishlist"

export default function WishlistPage() {
  const { addItem } = useCart()
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    const syncWishlist = () => setItems(getWishlistItems())

    syncWishlist()
    window.addEventListener(WISHLIST_CHANGED_EVENT, syncWishlist)
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, syncWishlist)
  }, [])

  const handleRemove = (productId: string) => {
    setItems(removeWishlistItem(productId))
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav items={[{ label: "Yêu thích" }]} />

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sản phẩm yêu thích
            </h1>
            <p className="mt-2 text-muted-foreground">
              Lưu lại các mẫu guitar bạn đang quan tâm để mua sau.
            </p>
          </div>
          {items.length > 0 ? (
            <p className="text-sm font-medium text-muted-foreground">
              {items.length} sản phẩm
            </p>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-lg border border-border">
            <EmptyState
              icon={Heart}
              title="Chưa có sản phẩm yêu thích"
              description="Bấm biểu tượng trái tim trên sản phẩm để lưu vào danh sách này."
              action={
                <Button asChild>
                  <Link href="/shop">Đến cửa hàng</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {items.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[112px_1fr_auto] sm:items-center"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted sm:h-28 sm:w-28"
                >
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=800&width=800"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-base font-semibold text-foreground transition-colors hover:text-accent"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
                  <p className="mt-2 text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </p>
                  <p className={`mt-1 text-sm ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                  </p>
                </div>

                <div className="flex gap-2 sm:flex-col">
                  <Button
                    className="flex-1 sm:flex-none"
                    onClick={() => addItem(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleRemove(product.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
