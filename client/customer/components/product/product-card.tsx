"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart()
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge className="bg-accent text-accent-foreground">Mới</Badge>
          )}
          {product.isBestSeller && (
            <Badge variant="secondary">Bán chạy</Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-md"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Thêm vào yêu thích</span>
          </Button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="w-full shadow-md"
            onClick={() => addItem(product)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        <Link href={`/product/${product.slug}`} className="mt-2 flex-1">
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="mt-2 text-sm text-destructive">
            Chỉ còn {product.stock} sản phẩm
          </p>
        )}
      </div>
    </div>
  )
}
