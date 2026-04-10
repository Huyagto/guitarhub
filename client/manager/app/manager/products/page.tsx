"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { ProductForm } from "@/components/dashboard/product-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import type { Category, Brand, Product } from "@/lib/manager-types"
import { Plus, MoreHorizontal, Pencil, Trash2, Package, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import {
  createManagerProduct,
  deleteManagerProduct,
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          getManagerProducts(),
          getManagerCategories(),
          getManagerBrands(),
        ])

        setProducts(productsRes.metadata)
        setCategories(categoriesRes.metadata)
        setBrands(brandsRes.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải dữ liệu sản phẩm"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

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
    { key: "category" as const, header: "Danh mục", render: (product: Product) => <span className="text-muted-foreground">{product.category}</span> },
    { key: "brand" as const, header: "Thương hiệu", render: (product: Product) => <span className="text-muted-foreground">{product.brand}</span> },
    { key: "price" as const, header: "Giá", render: (product: Product) => <span className="font-medium">${product.price.toLocaleString()}</span> },
    {
      key: "stock" as const,
      header: "Tồn kho",
      render: (product: Product) => (
        <span className={cn("font-medium", product.stock === 0 ? "text-destructive" : product.stock < 5 ? "text-warning" : "text-foreground")}>
          {product.stock}
        </span>
      ),
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
      <Topbar title="Sản phẩm" description="Quản lý danh mục sản phẩm" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả sản phẩm</h2>
                <p className="text-sm text-muted-foreground">Có {products.length} sản phẩm trong danh mục</p>
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
                data={products}
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
