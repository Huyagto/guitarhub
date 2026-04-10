"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatPrice } from "@/lib/format"
import type { BrandInfo, CategoryInfo } from "@/lib/types"

export interface FiltersState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean
}

interface ShopFiltersProps {
  filters: FiltersState
  categories: CategoryInfo[]
  brands: BrandInfo[]
  onFiltersChange: (filters: FiltersState) => void
}

function FiltersContent({
  filters,
  categories,
  brands,
  onFiltersChange,
}: ShopFiltersProps) {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["category", "brand", "price"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-semibold">
            Danh mục
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      const nextCategories = checked
                        ? [...filters.categories, category.id]
                        : filters.categories.filter((item) => item !== category.id)
                      onFiltersChange({ ...filters, categories: nextCategories })
                    }}
                  />
                  <Label htmlFor={category.id} className="cursor-pointer text-sm font-normal">
                    {category.name} ({category.productCount})
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-semibold">
            Thương hiệu
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={filters.brands.includes(brand.name)}
                    onCheckedChange={(checked) => {
                      const nextBrands = checked
                        ? [...filters.brands, brand.name]
                        : filters.brands.filter((item) => item !== brand.name)
                      onFiltersChange({ ...filters, brands: nextBrands })
                    }}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer text-sm font-normal">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold">
            Khoảng giá
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [value[0], value[1]] as [number, number],
                  })
                }
                max={100000000}
                step={100000}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                    Từ
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    min={0}
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: [Number(e.target.value || 0), filters.priceRange[1]],
                      })
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                    Đến
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    min={0}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: [filters.priceRange[0], Number(e.target.value || 0)],
                      })
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-semibold">
            Tình trạng
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, inStock: checked as boolean })
                }
              />
              <Label htmlFor="in-stock" className="cursor-pointer text-sm font-normal">
                Chỉ hiển thị sản phẩm còn hàng
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onFiltersChange({
            categories: [],
            brands: [],
            priceRange: [0, 100000000],
            inStock: false,
          })
        }
      >
        Xóa toàn bộ bộ lọc
      </Button>
    </div>
  )
}

export function ShopFilters({
  filters,
  categories,
  brands,
  onFiltersChange,
}: ShopFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000000 ? 1 : 0)

  return (
    <>
      <div className="hidden w-64 flex-shrink-0 lg:block">
        <div className="sticky top-24">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Bộ lọc</h2>
          <FiltersContent
            filters={filters}
            categories={categories}
            brands={brands}
            onFiltersChange={onFiltersChange}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent
                filters={filters}
                categories={categories}
                brands={brands}
                onFiltersChange={onFiltersChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export function ActiveFilters({
  filters,
  categories,
  brands,
  onFiltersChange,
}: ShopFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.inStock ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100000000

  if (!hasActiveFilters) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>

      {filters.categories.map((categoryId) => {
        const category = categories.find((item) => item.id === categoryId)
        return (
          <Button
            key={categoryId}
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() =>
              onFiltersChange({
                ...filters,
                categories: filters.categories.filter((item) => item !== categoryId),
              })
            }
          >
            {category?.name || categoryId}
            <X className="h-3 w-3" />
          </Button>
        )
      })}

      {filters.brands.map((brandName) => {
        const brand = brands.find((item) => item.name === brandName)
        return (
          <Button
            key={brandName}
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() =>
              onFiltersChange({
                ...filters,
                brands: filters.brands.filter((item) => item !== brandName),
              })
            }
          >
            {brand?.name || brandName}
            <X className="h-3 w-3" />
          </Button>
        )
      })}

      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000000) && (
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onFiltersChange({ ...filters, priceRange: [0, 100000000] })}
        >
          {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
          <X className="h-3 w-3" />
        </Button>
      )}

      {filters.inStock && (
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onFiltersChange({ ...filters, inStock: false })}
        >
          Còn hàng
          <X className="h-3 w-3" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground"
        onClick={() =>
          onFiltersChange({
            categories: [],
            brands: [],
            priceRange: [0, 100000000],
            inStock: false,
          })
        }
      >
        Xóa tất cả
      </Button>
    </div>
  )
}
