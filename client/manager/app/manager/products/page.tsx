"use client"

import { useState } from "react"
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
import { products as initialProducts, type Product } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  draft: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted text-muted-foreground border-muted",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })

  const handleAddProduct = (data: Partial<Product>) => {
    const newProduct: Product = {
      id: String(products.length + 1),
      name: data.name || "",
      sku: data.sku || "",
      category: data.category || "",
      brand: data.brand || "",
      price: data.price || 0,
      stock: data.stock || 0,
      status: data.status || "active",
      image: "/placeholder.svg?height=80&width=80",
      createdAt: new Date().toISOString().split("T")[0],
    }
    setProducts([newProduct, ...products])
  }

  const handleEditProduct = (data: Partial<Product>) => {
    if (!editingProduct) return
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...data } : p
      )
    )
    setEditingProduct(null)
  }

  const handleDeleteProduct = () => {
    if (!deleteDialog.product) return
    setProducts(products.filter((p) => p.id !== deleteDialog.product!.id))
    setDeleteDialog({ open: false, product: null })
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
      render: (product: Product) => (
        <span className="text-muted-foreground">{product.category}</span>
      ),
    },
    {
      key: "brand" as const,
      header: "Thương hiệu",
      render: (product: Product) => (
        <span className="text-muted-foreground">{product.brand}</span>
      ),
    },
    {
      key: "price" as const,
      header: "Giá",
      render: (product: Product) => (
        <span className="font-medium">${product.price.toLocaleString()}</span>
      ),
    },
    {
      key: "stock" as const,
      header: "Tồn kho",
      render: (product: Product) => (
        <span
          className={cn(
            "font-medium",
            product.stock === 0
              ? "text-destructive"
              : product.stock < 5
              ? "text-warning"
              : "text-foreground"
          )}
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (product: Product) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[product.status])}>
          {product.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Sản phẩm" description="Quản lý danh mục sản phẩm" />

      <main className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả sản phẩm</h2>
                <p className="text-sm text-muted-foreground">
                  Có {products.length} sản phẩm trong danh mục
                </p>
              </div>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>

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
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingProduct(product)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDialog({ open: true, product })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>
      </main>

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, product: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa &quot;{deleteDialog.product?.name}&quot; không? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
