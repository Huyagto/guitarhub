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
import { categories, brands } from "@/lib/mock-data"

interface FiltersState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean
}

interface ShopFiltersProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
}

function FiltersContent({ filters, onFiltersChange }: ShopFiltersProps) {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["category", "brand", "price"]} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-semibold">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...filters.categories, category.id]
                        : filters.categories.filter((c) => c !== category.id)
                      onFiltersChange({ ...filters, categories: newCategories })
                    }}
                  />
                  <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                    {category.name} ({category.productCount})
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-semibold">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={filters.brands.includes(brand.name)}
                    onCheckedChange={(checked) => {
                      const newBrands = checked
                        ? [...filters.brands, brand.name]
                        : filters.brands.filter((b) => b !== brand.name)
                      onFiltersChange({ ...filters, brands: newBrands })
                    }}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold">
            Price Range
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
                max={5000}
                step={50}
                className="w-full"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: [Number(e.target.value), filters.priceRange[1]],
                      })
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: [filters.priceRange[0], Number(e.target.value)],
                      })
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-semibold">
            Availability
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
              <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                In stock only
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
            priceRange: [0, 5000],
            inStock: false,
          })
        }
      >
        Clear all filters
      </Button>
    </div>
  )
}

export function ShopFilters({ filters, onFiltersChange }: ShopFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
          <FiltersContent filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent filters={filters} onFiltersChange={onFiltersChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export function ActiveFilters({
  filters,
  onFiltersChange,
}: ShopFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.inStock ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.categories.map((cat) => {
        const category = categories.find((c) => c.id === cat)
        return (
          <Button
            key={cat}
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() =>
              onFiltersChange({
                ...filters,
                categories: filters.categories.filter((c) => c !== cat),
              })
            }
          >
            {category?.name}
            <X className="h-3 w-3" />
          </Button>
        )
      })}
      
      {filters.brands.map((brand) => (
        <Button
          key={brand}
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() =>
            onFiltersChange({
              ...filters,
              brands: filters.brands.filter((b) => b !== brand),
            })
          }
        >
          {brand}
          <X className="h-3 w-3" />
        </Button>
      ))}
      
      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() =>
            onFiltersChange({ ...filters, priceRange: [0, 5000] })
          }
        >
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
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
          In stock
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
            priceRange: [0, 5000],
            inStock: false,
          })
        }
      >
        Clear all
      </Button>
    </div>
  )
}
