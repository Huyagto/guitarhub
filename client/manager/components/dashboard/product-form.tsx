"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
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
import type { Branch, Brand, Category, Product } from "@/lib/manager-types"
import { uploadManagerProductImage } from "@/lib/manager-data-api"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: Category[]
  brands: Brand[]
  branches: Branch[]
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

function getInitialBranchStocks(product: Product | null | undefined, branches: Branch[]) {
  const stockByBranch = new Map(product?.branchInventory?.map((item) => [item.branchId, String(item.stock)]) || [])

  return branches.reduce<Record<string, string>>((acc, branch) => {
    acc[branch.id] = stockByBranch.get(branch.id) || "0"
    return acc
  }, {})
}

export function ProductForm({ open, onOpenChange, product, categories, brands, branches, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    price: product?.price?.toString() || "",
    image: product?.image || "",
    status: product?.status || "active",
  })
  const [branchStocks, setBranchStocks] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setFormData({
      name: product?.name || "",
      slug: product?.slug || "",
      sku: product?.sku || "",
      categoryId: product?.categoryId || "",
      brandId: product?.brandId || "",
      price: product?.price?.toString() || "",
      image: product?.image || "",
      status: product?.status || "active",
    })
    setBranchStocks(getInitialBranchStocks(product, branches))
  }, [product, open, branches])

  const totalStock = useMemo(
    () => Object.values(branchStocks).reduce((sum, value) => sum + Number(value || 0), 0),
    [branchStocks]
  )

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    onSubmit({
      name: formData.name,
      slug: formData.slug || slugify(formData.name),
      sku: formData.sku,
      categoryId: Number(formData.categoryId),
      brandId: Number(formData.brandId),
      price: Number(formData.price),
      image: formData.image,
      status: formData.status.toUpperCase(),
      branchInventory: branches.map((branch) => ({
        branchId: Number(branch.id),
        stock: Number(branchStocks[branch.id] || 0),
      })),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {product ? "Cập nhật thông tin sản phẩm và tồn kho từng chi nhánh." : "Điền thông tin để thêm sản phẩm mới vào từng chi nhánh."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                    slug: product ? prev.slug : slugify(event.target.value),
                  }))
                }
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(event) => setFormData({ ...formData, slug: slugify(event.target.value) })}
                  placeholder="slug-san-pham"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(event) => setFormData({ ...formData, sku: event.target.value })}
                  placeholder="Nhập SKU"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Danh mục</Label>
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
                <Label>Thương hiệu</Label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Tổng tồn kho</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
                  {totalStock}
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-border p-4">
              <div>
                <Label>Tồn kho theo chi nhánh</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sản phẩm chỉ bán online/POS tại chi nhánh có tồn kho lớn hơn 0.
                </p>
              </div>
              {branches.length === 0 ? (
                <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Chưa có chi nhánh để gán tồn kho.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {branches.map((branch) => (
                    <div key={branch.id} className="grid gap-2">
                      <Label htmlFor={`branch-${branch.id}`}>
                        {branch.name} <span className="text-muted-foreground">({branch.code})</span>
                      </Label>
                      <Input
                        id={`branch-${branch.id}`}
                        type="number"
                        min="0"
                        value={branchStocks[branch.id] || "0"}
                        onChange={(event) =>
                          setBranchStocks((prev) => ({
                            ...prev,
                            [branch.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Trạng thái</Label>
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
            <Button type="submit" disabled={isUploading || branches.length === 0}>
              {product ? "Cập nhật" : "Thêm"} sản phẩm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
