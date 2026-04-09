"use client"

import { useState, useMemo } from "react"
import { Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { ProductCard } from "@/components/product/product-card"
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton"
import { ShopFilters, ActiveFilters } from "@/components/shop/shop-filters"
import { EmptyState } from "@/components/ui/empty-state"
import { products } from "@/lib/mock-data"
import { SearchX, Package } from "lucide-react"

type SortOption = "latest" | "price-asc" | "price-desc" | "best-selling"
type ViewMode = "grid" | "list"

export default function ShopPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("latest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: [0, 5000] as [number, number],
    inStock: false,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand))
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Stock filter
    if (filters.inStock) {
      result = result.filter((p) => p.stock > 0)
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "best-selling":
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
        break
      case "latest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [search, filters, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav items={[{ label: "Cửa hàng" }]} />

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tất cả guitar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Khám phá toàn bộ bộ sưu tập guitar và phụ kiện cao cấp của chúng tôi.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Filters sidebar */}
          <ShopFilters filters={filters} onFiltersChange={setFilters} />

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Sắp xếp:
                  </span>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá: thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá: cao đến thấp</SelectItem>
                      <SelectItem value="best-selling">Bán chạy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Dạng lưới</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">Dạng danh sách</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            <div className="mt-4">
              <ActiveFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Results count */}
            <p className="mt-4 text-sm text-muted-foreground">
              Hiển thị {paginatedProducts.length} / {filteredProducts.length} sản phẩm
            </p>

            {/* Products grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div
                  className={`mt-6 grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-12">
                <EmptyState
                  icon={search ? SearchX : Package}
                  title={search ? "Không tìm thấy kết quả" : "Không có sản phẩm"}
                  description={
                    search
                      ? `Không tìm thấy sản phẩm nào khớp với "${search}". Hãy thử thay đổi từ khóa hoặc bộ lọc.`
                      : "Không có sản phẩm nào khớp với bộ lọc hiện tại. Hãy thử điều chỉnh tiêu chí."
                  }
                  action={
                    <Button
                      onClick={() => {
                        setSearch("")
                        setFilters({
                          categories: [],
                          brands: [],
                          priceRange: [0, 5000],
                          inStock: false,
                        })
                      }}
                    >
                      Xóa tất cả bộ lọc
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
