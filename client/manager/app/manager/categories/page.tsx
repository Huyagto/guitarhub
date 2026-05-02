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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Category } from "@/lib/manager-types"
import { FolderTree, Loader2, MoreHorizontal, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { createManagerCategory, deleteManagerCategory, getManagerCategories, updateManagerCategory, uploadManagerImage } from "@/lib/manager-data-api"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null })
  const [formData, setFormData] = useState({ name: "", description: "", image: "", status: "active" as "active" | "inactive" })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getManagerCategories()
        setCategories(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải danh mục"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadCategories()
  }, [])

  const resetForm = () => {
    setFormData({ name: "", description: "", image: "", status: "active" })
    setEditingCategory(null)
  }

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description, image: category.image || "", status: category.status })
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
        setFormData((prev) => ({ ...prev, image: upload.metadata.url }))
      } catch (uploadError) {
        setError(getErrorMessage(uploadError, "Không thể tải ảnh danh mục"))
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        const response = await updateManagerCategory(editingCategory.id, formData)
        setCategories((prev) => prev.map((item) => (item.id === editingCategory.id ? response.metadata : item)))
      } else {
        const response = await createManagerCategory({ ...formData, productCount: 0 })
        setCategories((prev) => [response.metadata, ...prev])
      }
      setFormOpen(false)
      resetForm()
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu danh mục"))
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.category) return
    try {
      await deleteManagerCategory(deleteDialog.category.id)
      setCategories((prev) => prev.filter((item) => item.id !== deleteDialog.category?.id))
      setDeleteDialog({ open: false, category: null })
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể xóa danh mục"))
    }
  }

  const columns = [
    {
      key: "name" as const,
      header: "Danh mục",
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          {category.image ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-secondary">
              <Image src={category.image} alt={category.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <FolderTree className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
          </div>
        </div>
      ),
    },
    { key: "productCount" as const, header: "Sản phẩm", render: (category: Category) => <span className="text-muted-foreground">{category.productCount} sản phẩm</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (category: Category) => (
        <Badge variant="outline" className={cn("capitalize", category.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted")}>
          {category.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Danh mục" description="Sắp xếp sản phẩm theo từng danh mục" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả danh mục</h2>
                <p className="text-sm text-muted-foreground">Tổng cộng {categories.length} danh mục</p>
              </div>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                data={categories}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Tìm danh mục..."
                actions={(category) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenForm(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ open: true, category })}>
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
            <DialogTitle>{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
            <DialogDescription>{editingCategory ? "Cập nhật thông tin danh mục bên dưới." : "Tạo một danh mục sản phẩm mới."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nhập tên danh mục" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Nhập mô tả danh mục" rows={3} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="image">Ảnh danh mục</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                {isUploading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải ảnh lên Cloudinary...
                  </div>
                ) : null}
                {formData.image ? (
                  <div className="relative h-32 overflow-hidden rounded-lg border bg-muted">
                    <Image src={formData.image} alt="Ảnh danh mục" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Chưa có ảnh danh mục
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isUploading}>{editingCategory ? "Cập nhật" : "Thêm"} danh mục</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa &quot;{deleteDialog.category?.name}&quot; không? Hành động này sẽ không xóa các sản phẩm đang thuộc danh mục này.</AlertDialogDescription>
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
