"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Heart, Share2, Check, Truck, ShieldCheck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuantitySelector } from "@/components/ui/quantity-selector"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const handleAddToCart = () => {
    addItem(product, quantity)
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    router.push("/cart")
  }

  return (
    <div className="flex flex-col">
      {/* Brand & Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">{product.brand}</span>
        {product.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.rating)
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{product.rating}</span>
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount} đánh giá)
        </span>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
            <Badge className="bg-destructive text-destructive-foreground">
              Tiết kiệm {discount}%
            </Badge>
          </>
        )}
      </div>

      {/* Availability */}
      <div className="mt-4">
        {product.stock > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">Còn hàng</span>
            {product.stock <= 10 && (
              <span className="text-muted-foreground">
                - Chỉ còn {product.stock} sản phẩm
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-destructive font-medium">Hết hàng</span>
        )}
      </div>

      {/* Short description */}
      <p className="mt-6 text-muted-foreground leading-relaxed">
        {product.shortDescription}
      </p>

      {/* Quantity & Actions */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Số lượng:</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={product.stock}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Thêm vào giỏ
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            Mua ngay
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-destructive text-destructive" : ""
              }`}
            />
            {isWishlisted ? "Đã lưu" : "Lưu"}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border border-border p-4">
        <div className="flex flex-col items-center text-center">
          <Truck className="h-5 w-5 text-accent" />
          <span className="mt-2 text-xs font-medium">Giao hàng miễn phí</span>
          <span className="text-xs text-muted-foreground">Đơn trên 500 USD</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <span className="mt-2 text-xs font-medium">Chính hãng</span>
          <span className="text-xs text-muted-foreground">Cam kết</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <RotateCcw className="h-5 w-5 text-accent" />
          <span className="mt-2 text-xs font-medium">Đổi trả dễ dàng</span>
          <span className="text-xs text-muted-foreground">Trong 30 ngày</span>
        </div>
      </div>
    </div>
  )
}
