"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Brand } from "@/lib/manager-types"
import { cn } from "@/lib/utils"
import { Loader2, MoreHorizontal, Pencil, Plus, Tags, Trash2, Upload } from "lucide-react"
import { createManagerBrand, deleteManagerBrand, getManagerBrands, updateManagerBrand, uploadManagerImage } from "@/lib/manager-data-api"
import { getErrorMessage } from "@/lib/api"

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; brand: Brand | null }>({ open: false, brand: null })
  const [formData, setFormData] = useState({ name: "", logo: "", status: "active" as "active" | "inactive" })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await getManagerBrands()
        setBrands(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải thương hiệu"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBrands()
  }, [])

  const resetForm = () => {
    setFormData({ name: "", logo: "", status: "active" })
    setEditingBrand(null)
  }

  const handleOpenForm = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({ name: brand.name, logo: brand.logo || "", status: brand.status })
    } else {
      resetForm()
    }
    setFormOpen(true)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        setIsUploading(true)
        const upload = await uploadManagerImage(String(reader.result))
        setFormData((prev) => ({ ...prev, logo: upload.metadata.url }))
      } catch (uploadError) {
        setError(getErrorMessage(uploadError, "Không thể tải ảnh thương hiệu"))
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBrand) {
        const response = await updateManagerBrand(editingBrand.id, formData)
        setBrands((prev) => prev.map((item) => (item.id === editingBrand.id ? response.metadata : item)))
      } else {
        const response = await createManagerBrand({ ...formData, productCount: 0 })
        setBrands((prev) => [response.metadata, ...prev])
      }
      setFormOpen(false)
      resetForm()
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu thương hiệu"))
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.brand) return
    try {
      await deleteManagerBrand(deleteDialog.brand.id)
      setBrands((prev) => prev.filter((item) => item.id !== deleteDialog.brand?.id))
      setDeleteDialog({ open: false, brand: null })
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể xóa thương hiệu"))
    }
  }

  const columns = [
    {
      key: "name" as const,
      header: "Thương hiệu",
      render: (brand: Brand) => (
        <div className="flex items-center gap-3">
          {brand.logo ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-secondary">
              <Image src={brand.logo} alt={brand.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Tags className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <p className="font-medium text-foreground">{brand.name}</p>
        </div>
      ),
    },
    { key: "productCount" as const, header: "Sản phẩm", render: (brand: Brand) => <span className="text-muted-foreground">{brand.productCount} sản phẩm</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (brand: Brand) => (
        <Badge variant="outline" className={cn("capitalize", brand.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted")}>
          {brand.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Thương hiệu" description="Quản lý thương hiệu sản phẩm" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả thương hiệu</h2>
                <p className="text-sm text-muted-foreground">Tổng cộng {brands.length} thương hiệu</p>
              </div>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thương hiệu
              </Button>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={brands}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Tìm thương hiệu..."
                actions={(brand) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenForm(brand)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ open: true, brand })}>
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

      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}</DialogTitle>
            <DialogDescription>{editingBrand ? "Cập nhật thông tin thương hiệu bên dưới." : "Thêm thương hiệu mới vào danh mục."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên thương hiệu</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nhập tên thương hiệu" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="logo">Logo thương hiệu</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
                {isUploading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải ảnh lên Cloudinary...
                  </div>
                ) : null}
                {formData.logo ? (
                  <div className="relative h-32 overflow-hidden rounded-lg border bg-muted">
                    <Image src={formData.logo} alt="Logo thương hiệu" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Chưa có logo thương hiệu
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isUploading}>{editingBrand ? "Cập nhật" : "Thêm"} thương hiệu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, brand: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thương hiệu</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa &quot;{deleteDialog.brand?.name}&quot; không? Hành động này sẽ không xóa các sản phẩm đang thuộc thương hiệu này.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
