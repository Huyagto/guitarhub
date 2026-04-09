'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProductCard } from './product-card'
import { type Product, type OrderItem, categories, products } from '@/lib/pos-data'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  orderItems: OrderItem[]
  onAddProduct: (product: Product) => void
  onRemoveProduct: (productId: string) => void
}

export function ProductGrid({
  orderItems,
  onAddProduct,
  onRemoveProduct,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const getQuantityInCart = (productId: string) => {
    const item = orderItems.find((i) => i.product.id === productId)
    return item?.quantity || 0
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search Bar */}
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm theo tên hoặc SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 text-base"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'shrink-0',
                  selectedCategory === category.id && 'shadow-sm'
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                Không tìm thấy sản phẩm
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hãy thử thay đổi từ khóa hoặc bộ lọc
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getQuantityInCart(product.id)}
                  onAdd={() => onAddProduct(product)}
                  onRemove={() => onRemoveProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
