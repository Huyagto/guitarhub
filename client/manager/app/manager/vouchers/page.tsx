"use client"

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
import type { Voucher } from "@/lib/manager-types"
import { cn } from "@/lib/utils"
import { Copy, Loader2, MoreHorizontal, Pencil, Plus, Ticket, Trash2 } from "lucide-react"
import { createManagerVoucher, deleteManagerVoucher, getManagerVouchers, updateManagerVoucher } from "@/lib/manager-data-api"
import { getErrorMessage } from "@/lib/api"

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  expired: "bg-muted text-muted-foreground border-muted",
  disabled: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; voucher: Voucher | null }>({ open: false, voucher: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    usageLimit: "",
    expiresAt: "",
  })

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const response = await getManagerVouchers()
        setVouchers(response.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải mã giảm giá"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadVouchers()
  }, [])

  const resetForm = () => {
    setFormData({ code: "", type: "percentage", value: "", minPurchase: "", usageLimit: "", expiresAt: "" })
    setEditingVoucher(null)
  }

  const handleOpenForm = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher)
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: String(voucher.value),
        minPurchase: String(voucher.minPurchase),
        usageLimit: String(voucher.usageLimit),
        expiresAt: voucher.expiresAt,
      })
    } else {
      resetForm()
    }
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseInt(formData.value, 10),
      minPurchase: parseInt(formData.minPurchase, 10),
      usageLimit: parseInt(formData.usageLimit, 10),
      expiresAt: formData.expiresAt,
      ...(editingVoucher ? {} : { usedCount: 0, status: "active" as const }),
    }

    try {
      if (editingVoucher) {
        const response = await updateManagerVoucher(editingVoucher.id, payload)
        setVouchers((prev) => prev.map((item) => (item.id === editingVoucher.id ? response.metadata : item)))
      } else {
        const response = await createManagerVoucher(payload)
        setVouchers((prev) => [response.metadata, ...prev])
      }
      setFormOpen(false)
      resetForm()
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu mã giảm giá"))
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.voucher) return
    try {
      await deleteManagerVoucher(deleteDialog.voucher.id)
      setVouchers((prev) => prev.filter((item) => item.id !== deleteDialog.voucher?.id))
      setDeleteDialog({ open: false, voucher: null })
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể xóa mã giảm giá"))
    }
  }

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code)
  }

  const columns = [
    {
      key: "code" as const,
      header: "Mã",
      render: (voucher: Voucher) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Ticket className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-foreground">{voucher.code}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(voucher.code)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
    },
    { key: "value" as const, header: "Giảm giá", render: (voucher: Voucher) => <span className="font-medium text-primary">{voucher.type === "percentage" ? `${voucher.value}%` : `$${voucher.value}`}</span> },
    { key: "minPurchase" as const, header: "Đơn tối thiểu", render: (voucher: Voucher) => <span className="text-muted-foreground">${voucher.minPurchase}</span> },
    { key: "usage" as const, header: "Lượt dùng", render: (voucher: Voucher) => <span className="text-muted-foreground">{voucher.usedCount} / {voucher.usageLimit === 0 ? "Không giới hạn" : voucher.usageLimit}</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (voucher: Voucher) => <Badge variant="outline" className={cn("capitalize", statusStyles[voucher.status])}>{voucher.status === "active" ? "Đang hoạt động" : voucher.status === "expired" ? "Hết hạn" : "Đã tắt"}</Badge>,
    },
    { key: "expiresAt" as const, header: "Hết hạn", render: (voucher: Voucher) => <span className="text-muted-foreground">{new Date(voucher.expiresAt).toLocaleDateString()}</span> },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Mã giảm giá" description="Quản lý mã ưu đãi và chương trình khuyến mãi" />
      <main className="p-6">
        {error ? <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Tất cả mã giảm giá</h2>
                <p className="text-sm text-muted-foreground">{vouchers.filter((voucher) => voucher.status === "active").length} mã đang hoạt động</p>
              </div>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo mã giảm giá
              </Button>
            </div>

            {isLoading ? <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
              <DataTable
                data={vouchers}
                columns={columns}
                searchKey="code"
                searchPlaceholder="Tìm mã giảm giá..."
                actions={(voucher) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenForm(voucher)}><Pencil className="mr-2 h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ open: true, voucher })}><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
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
            <DialogTitle>{editingVoucher ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</DialogTitle>
            <DialogDescription>{editingVoucher ? "Cập nhật thông tin mã giảm giá bên dưới." : "Tạo một mã giảm giá mới."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã giảm giá</Label>
                <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="Ví dụ: SUMMER2024" className="font-mono" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Loại giảm giá</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "percentage" | "fixed" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                      <SelectItem value="fixed">Số tiền cố định ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Giá trị</Label>
                  <Input id="value" type="number" min="1" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={formData.type === "percentage" ? "Ví dụ: 15" : "Ví dụ: 50"} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minPurchase">Đơn tối thiểu ($)</Label>
                  <Input id="minPurchase" type="number" min="0" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })} placeholder="0" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                  <Input id="usageLimit" type="number" min="0" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} placeholder="0 là không giới hạn" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Ngày hết hạn</Label>
                <Input id="expiresAt" type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit">{editingVoucher ? "Cập nhật" : "Tạo"} mã giảm giá</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, voucher: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa mã &quot;{deleteDialog.voucher?.code}&quot; không? Hành động này không thể hoàn tác.</AlertDialogDescription>
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
