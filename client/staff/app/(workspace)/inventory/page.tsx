"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Loader2, PackageCheck, PackageX, Search } from "lucide-react"
import { getErrorMessage } from "@/lib/api"
import { getPosCatalog } from "@/lib/pos-api"
import type { Product } from "@/lib/pos-data"
import { formatCurrency } from "@/lib/pos-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type StockFilter = "all" | "available" | "low" | "out"

function getStockState(product: Product) {
  if (product.stock <= 0) return "out"
  if (product.stock <= 3) return "low"
  return "available"
}

export default function StaffInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StockFilter>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await getPosCatalog()
        setProducts(response.metadata.products)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải tồn kho cửa hàng"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadInventory()
  }, [])

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)

      if (!matchesSearch) return false
      if (filter === "all") return true
      return getStockState(product) === filter
    })
  }, [filter, products, search])

  const summary = useMemo(
    () => ({
      total: products.length,
      available: products.filter((product) => product.stock > 0).length,
      low: products.filter((product) => product.stock > 0 && product.stock <= 3).length,
      out: products.filter((product) => product.stock <= 0).length,
    }),
    [products]
  )

  const filterButtons: Array<{ key: StockFilter; label: string; count: number }> = [
    { key: "all", label: "Tất cả", count: summary.total },
    { key: "available", label: "Còn hàng", count: summary.available },
    { key: "low", label: "Sắp hết", count: summary.low },
    { key: "out", label: "Hết hàng", count: summary.out },
  ]

  return (
    <main className="h-full overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Mã hàng</p>
                <p className="text-2xl font-semibold">{summary.total}</p>
              </div>
              <PackageCheck className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Còn hàng</p>
                <p className="text-2xl font-semibold">{summary.available}</p>
              </div>
              <PackageCheck className="h-5 w-5 text-emerald-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết</p>
                <p className="text-2xl font-semibold">{summary.low}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Hết hàng</p>
                <p className="text-2xl font-semibold">{summary.out}</p>
              </div>
              <PackageX className="h-5 w-5 text-destructive" />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Tồn kho hiện đang có ở cửa hàng</CardTitle>
            <p className="text-sm text-muted-foreground">
              Số lượng hiển thị là tồn kho của chi nhánh đang đăng nhập.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên hoặc SKU..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filterButtons.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      filter === item.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Tồn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const state = getStockState(product)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right font-semibold">{product.stock}</TableCell>
                        <TableCell>
                          {state === "out" ? (
                            <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                              Hết hàng
                            </Badge>
                          ) : state === "low" ? (
                            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700">
                              Sắp hết
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                              Còn hàng
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
