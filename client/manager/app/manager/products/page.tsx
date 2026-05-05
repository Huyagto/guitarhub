"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, MoreHorizontal, Package, Pencil, Plus, Trash2 } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { ProductForm } from "@/components/dashboard/product-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Branch, Brand, Category, Product } from "@/lib/manager-types"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import {
  createManagerProduct,
  deleteManagerProduct,
  getManagerBranches,
  getManagerBrands,
  getManagerCategories,
  getManagerProducts,
  updateManagerProduct,
} from "@/lib/manager-data-api"

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  draft: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted text-muted-foreground border-muted",
}

function getBranchStock(product: Product, branchId: string) {
  if (branchId === "all") return product.stock
  return product.branchInventory?.find((item) => item.branchId === branchId)?.stock || 0
}

function getBranchLabel(branches: Branch[], branchId: string) {
  if (branchId === "all") return "Tất cả chi nhánh"
  const branch = branches.find((item) => item.id === branchId)
  return branch ? `${branch.code} - ${branch.name}` : "Chi nhánh đã chọn"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchFilter, setBranchFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsRes, categoriesRes, brandsRes, branchesRes] = await Promise.all([
        getManagerProducts(),
        getManagerCategories(),
        getManagerBrands(),
        getManagerBranches(),
      ])

      setProducts(productsRes.metadata)
      setCategories(categoriesRes.metadata)
      setBrands(brandsRes.metadata)
      setBranches(branchesRes.metadata)
      setError("")
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Không thể tải dữ liệu sản phẩm"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = getBranchStock(product, branchFilter)
      if (availabilityFilter === "available") return stock > 0
      if (availabilityFilter === "out") return stock === 0
      return true
    })
  }, [availabilityFilter, branchFilter, products])

  const totalVisibleStock = useMemo(
    () => filteredProducts.reduce((sum, product) => sum + getBranchStock(product, branchFilter), 0),
    [branchFilter, filteredProducts]
  )

  const handleAddProduct = async (data: Record<string, unknown>) => {
    try {
      const response = await createManagerProduct(data as Partial<Product>)
      setProducts((prev) => [response.metadata, ...prev])
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể thêm sản phẩm"))
    }
  }

  const handleEditProduct = async (data: Record<string, unknown>) => {
    if (!editingProduct) return
    try {
      const response = await updateManagerProduct(editingProduct.id, data as Partial<Product>)
      setProducts((prev) => prev.map((item) => (item.id === editingProduct.id ? response.metadata : item)))
      setEditingProduct(null)
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể cập nhật sản phẩm"))
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return
    try {
      await deleteManagerProduct(deleteDialog.product.id)
      setProducts((prev) => prev.filter((item) => item.id !== deleteDialog.product?.id))
      setDeleteDialog({ open: false, product: null })
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể xóa sản phẩm"))
    }
  }

  const columns = [
    {
      key: "name" as const,
      header: "Sản phẩm",
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category" as const,
      header: "Danh mục",
      render: (product: Product) => <span className="text-muted-foreground">{product.category}</span>,
    },
    {
      key: "brand" as const,
      header: "Thương hiệu",
      render: (product: Product) => <span className="text-muted-foreground">{product.brand}</span>,
    },
    {
      key: "price" as const,
      header: "Giá",
      render: (product: Product) => <span className="font-medium">{product.price.toLocaleString("vi-VN")} VND</span>,
    },
    {
      key: "stock" as const,
      header: branchFilter === "all" ? "Tồn tổng" : "Tồn tại chi nhánh",
      render: (product: Product) => {
        const displayStock = getBranchStock(product, branchFilter)
        const selectedInventory = product.branchInventory?.find((item) => item.branchId === branchFilter)

        return (
          <div>
            <span className={cn("font-medium", displayStock === 0 ? "text-destructive" : displayStock < 5 ? "text-warning" : "text-foreground")}>
              {displayStock}
            </span>
            {branchFilter === "all" ? (
              product.branchInventory?.length ? (
                <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">
                  {product.branchInventory.map((item) => `${item.branchCode || item.branchName}: ${item.stock}`).join(" | ")}
                </p>
              ) : null
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedInventory?.branchName || getBranchLabel(branches, branchFilter)}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (product: Product) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[product.status])}>
          {product.status === "active" ? "Đang hoạt động" : product.status === "draft" ? "Bản nháp" : "Lưu trữ"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Sản phẩm" description="Quản lý sản phẩm và tồn kho theo từng chi nhánh" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}

        <Card className="mb-6 bg-card border-border">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="grid gap-2">
              <Label>Chi nhánh</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.code} - {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái tồn</Label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hàng hóa</SelectItem>
                  <SelectItem value="available">Chỉ hàng đang có</SelectItem>
                  <SelectItem value="out">Chỉ hàng hết tồn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">{getBranchLabel(branches, branchFilter)}</p>
              <p className="mt-1 text-2xl font-bold">{totalVisibleStock.toLocaleString("vi-VN")}</p>
              <p className="text-xs text-muted-foreground">tồn kho trong danh sách đang xem</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {branchFilter === "all" ? "Tất cả sản phẩm" : `Sản phẩm tại ${getBranchLabel(branches, branchFilter)}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Có {filteredProducts.length} sản phẩm phù hợp bộ lọc
                </p>
              </div>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={filteredProducts}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Tìm sản phẩm..."
                actions={(product) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingProduct(product); setFormOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ open: true, product })}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <ProductForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        categories={categories}
        brands={brands}
        branches={branches}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa &quot;{deleteDialog.product?.name}&quot; không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
