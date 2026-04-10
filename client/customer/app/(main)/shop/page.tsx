"use client"

import { useEffect, useMemo, useState } from "react"
import { LayoutGrid, List, Package, Search, SearchX } from "lucide-react"
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
import { ActiveFilters, ShopFilters, type FiltersState } from "@/components/shop/shop-filters"
import { EmptyState } from "@/components/ui/empty-state"
import { getCatalogBrands, getCatalogCategories, getCatalogProducts } from "@/lib/catalog-api"
import type { BrandInfo, CategoryInfo, Product } from "@/lib/types"

type SortOption = "latest" | "price-asc" | "price-desc" | "best-selling"
type ViewMode = "grid" | "list"

export default function ShopPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("latest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    brands: [],
    priceRange: [0, 100000000],
    inStock: false,
  })
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [brands, setBrands] = useState<BrandInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          getCatalogProducts(),
          getCatalogCategories(),
          getCatalogBrands(),
        ])

        setProducts(productsData)
        setCategories(categoriesData)
        setBrands(brandsData)
      } catch {
        setProducts([])
        setCategories([])
        setBrands([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadCatalog()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (search) {
      const keyword = search.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword) ||
          product.brand.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword) ||
          product.shortDescription.toLowerCase().includes(keyword)
      )
    }

    if (filters.categories.length > 0) {
      result = result.filter((product) => filters.categories.includes(product.category))
    }

    if (filters.brands.length > 0) {
      result = result.filter((product) => filters.brands.includes(product.brand))
    }

    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    )

    if (filters.inStock) {
      result = result.filter((product) => product.stock > 0)
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "best-selling":
        result.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller))
        break
      case "latest":
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [filters, products, search, sortBy])

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
            Khám phá toàn bộ bộ sưu tập guitar và phụ kiện đang có tại GuitarHub.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <ShopFilters
            filters={filters}
            categories={categories}
            brands={brands}
            onFiltersChange={(nextFilters) => {
              setFilters(nextFilters)
              setCurrentPage(1)
            }}
          />

          <div className="flex-1">
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
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                    Sắp xếp:
                  </span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                      <SelectItem value="best-selling">Bán chạy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden items-center gap-1 rounded-lg border p-1 sm:flex">
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

            <div className="mt-4">
              <ActiveFilters
                filters={filters}
                categories={categories}
                brands={brands}
                onFiltersChange={(nextFilters) => {
                  setFilters(nextFilters)
                  setCurrentPage(1)
                }}
              />
            </div>

            {!isLoading && (
              <p className="mt-4 text-sm text-muted-foreground">
                Hiển thị {paginatedProducts.length} / {filteredProducts.length} sản phẩm
              </p>
            )}

            {isLoading ? (
              <div
                className={`mt-6 grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
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

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
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
                  title={search ? "Không tìm thấy kết quả" : "Chưa có sản phẩm phù hợp"}
                  description={
                    search
                      ? `Không tìm thấy sản phẩm nào khớp với "${search}". Hãy thử từ khóa khác hoặc điều chỉnh bộ lọc.`
                      : "Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi điều kiện tìm kiếm."
                  }
                  action={
                    <Button
                      onClick={() => {
                        setSearch("")
                        setFilters({
                          categories: [],
                          brands: [],
                          priceRange: [0, 100000000],
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
