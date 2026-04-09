'use client'

import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Product, formatCurrency } from '@/lib/pos-data'

interface ProductCardProps {
  product: Product
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 3

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-foreground">
            Low Stock: {product.stock}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-muted-foreground">{product.sku}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-semibold text-primary">
          {formatCurrency(product.price)}
        </p>

        <div className="mt-3 flex items-center gap-2">
          {quantity > 0 ? (
            <div className="flex flex-1 items-center justify-between rounded-md border border-border bg-muted/50">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRemove}
                className="h-9 w-9 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2rem] text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onAdd}
                disabled={quantity >= product.stock}
                className="h-9 w-9 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={onAdd}
              disabled={isOutOfStock}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
