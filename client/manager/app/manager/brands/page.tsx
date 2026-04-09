"use client"

import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { brands as initialBrands, type Brand } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Pencil, Trash2, Tags } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; brand: Brand | null }>({
    open: false,
    brand: null,
  })
  const [formData, setFormData] = useState({
    name: "",
    status: "active" as "active" | "inactive",
  })

  const resetForm = () => {
    setFormData({ name: "", status: "active" })
    setEditingBrand(null)
  }

  const handleOpenForm = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        status: brand.status,
      })
    } else {
      resetForm()
    }
    setFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBrand) {
      setBrands(
        brands.map((b) =>
          b.id === editingBrand.id ? { ...b, ...formData } : b
        )
      )
    } else {
      const newBrand: Brand = {
        id: String(brands.length + 1),
        ...formData,
        logo: "/placeholder.svg?height=40&width=40",
        productCount: 0,
      }
      setBrands([newBrand, ...brands])
    }
    setFormOpen(false)
    resetForm()
  }

  const handleDelete = () => {
    if (!deleteDialog.brand) return
    setBrands(brands.filter((b) => b.id !== deleteDialog.brand!.id))
    setDeleteDialog({ open: false, brand: null })
  }

  const columns = [
    {
      key: "name" as const,
      header: "Thương hiệu",
      render: (brand: Brand) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Tags className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">{brand.name}</p>
        </div>
      ),
    },
    {
      key: "productCount" as const,
      header: "Sản phẩm",
      render: (brand: Brand) => (
        <span className="text-muted-foreground">{brand.productCount} sản phẩm</span>
      ),
    },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (brand: Brand) => (
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            brand.status === "active"
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground border-muted"
          )}
        >
          {brand.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Thương hiệu" description="Quản lý thương hiệu sản phẩm" />

      <main className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả thương hiệu</h2>
                <p className="text-sm text-muted-foreground">
                  Tổng cộng {brands.length} thương hiệu
                </p>
              </div>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thương hiệu
              </Button>
            </div>

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
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDialog({ open: true, brand })}
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

      {/* Brand Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}</DialogTitle>
            <DialogDescription>
              {editingBrand ? "Cập nhật thông tin thương hiệu bên dưới." : "Thêm thương hiệu mới vào danh mục."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên thương hiệu</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên thương hiệu"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">{editingBrand ? "Cập nhật" : "Thêm"} thương hiệu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, brand: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thương hiệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa &quot;{deleteDialog.brand?.name}&quot; không? Hành động này sẽ
              không xóa các sản phẩm đang thuộc thương hiệu này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
