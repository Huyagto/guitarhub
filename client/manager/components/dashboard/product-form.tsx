"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Brand, Category, Product } from "@/lib/manager-types"
import { uploadManagerProductImage } from "@/lib/manager-data-api"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  brands: Brand[]
  onSubmit: (data: Record<string, unknown>) => void
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function ProductForm({ open, onOpenChange, product, categories, brands, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "",
    image: product?.image || "",
    status: product?.status || "active",
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setFormData({
      name: product?.name || "",
      slug: product?.slug || "",
      sku: product?.sku || "",
      categoryId: product?.categoryId || "",
      brandId: product?.brandId || "",
      price: product?.price?.toString() || "",
      stock: product?.stock?.toString() || "",
      image: product?.image || "",
      status: product?.status || "active",
    })
  }, [product, open])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        setIsUploading(true)
        const upload = await uploadManagerProductImage(String(reader.result))
        setFormData((prev) => ({
          ...prev,
          image: upload.metadata.url,
        }))
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name: formData.name,
      slug: formData.slug || slugify(formData.name),
      sku: formData.sku,
      categoryId: Number(formData.categoryId),
      brandId: Number(formData.brandId),
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: formData.image,
      status: formData.status.toUpperCase(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {product ? "Cập nhật thông tin sản phẩm bên dưới." : "Điền thông tin để thêm sản phẩm mới."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                    slug: product ? prev.slug : slugify(e.target.value),
                  }))
                }
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  placeholder="slug-san-pham"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Nhập SKU"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={String(formData.categoryId)}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Thương hiệu</Label>
                <Select
                  value={String(formData.brandId)}
                  onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Product["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="image">Ảnh sản phẩm</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
              {isUploading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải ảnh lên Cloudinary...
                </div>
              ) : null}
              {formData.image ? (
                <div className="relative h-40 overflow-hidden rounded-lg border bg-muted">
                  <Image src={formData.image} alt="Ảnh sản phẩm" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  <Upload className="mr-2 h-4 w-4" />
                  Chưa có ảnh sản phẩm
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isUploading}>
              {product ? "Cập nhật" : "Thêm"} sản phẩm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
