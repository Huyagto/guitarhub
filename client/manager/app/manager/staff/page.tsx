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
import { Switch } from "@/components/ui/switch"
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
  DropdownMenuSeparator,
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
import type { Branch, Staff } from "@/lib/manager-types"
import {
  createManagerStaff,
  deleteManagerStaff,
  getManagerBranches,
  getManagerStaffs,
  regenerateManagerStaffCode,
  resetManagerStaffPassword,
  updateManagerStaff,
} from "@/lib/manager-data-api"
import { getErrorMessage } from "@/lib/api"
import { BadgeCheck, Copy, Eye, EyeOff, KeyRound, Loader2, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react"

type FormMode = "create" | "edit"

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  branchId: "",
  isActive: true,
}

export default function StaffPage() {
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)

  // dialog hiển thị mã sau khi tạo
  const [createdStaffCode, setCreatedStaffCode] = useState<{ open: boolean; staff: Staff | null }>({ open: false, staff: null })

  // reset password dialog
  const [resetDialog, setResetDialog] = useState<{ open: boolean; staff: Staff | null }>({ open: false, staff: null })
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // regenerate code
  const [isRegenerating, setIsRegenerating] = useState(false)

  // delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; staff: Staff | null }>({ open: false, staff: null })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    void loadStaffs()
  }, [])

  const loadStaffs = async () => {
    setIsLoading(true)
    try {
      const [staffResponse, branchResponse] = await Promise.all([
        getManagerStaffs(),
        getManagerBranches(),
      ])
      setStaffs(staffResponse.metadata)
      setBranches(branchResponse.metadata)
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải danh sách nhân viên"))
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateForm = () => {
    setFormMode("create")
    setEditingStaff(null)
    setFormData(emptyForm)
    setShowPassword(false)
    setFormOpen(true)
  }

  const openEditForm = (staff: Staff) => {
    setFormMode("edit")
    setEditingStaff(staff)
    setFormData({ fullName: staff.fullName, email: staff.email, phone: staff.phone, password: "", branchId: staff.branchId || "", isActive: staff.isActive })
    setShowPassword(false)
    setFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      if (formMode === "create") {
        const response = await createManagerStaff({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          branchId: formData.branchId || undefined,
          password: formData.password,
        })
        setStaffs((prev) => [response.metadata, ...prev])
        setFormOpen(false)
        setCreatedStaffCode({ open: true, staff: response.metadata })
        return
      } else if (editingStaff) {
        const response = await updateManagerStaff(editingStaff.id, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          branchId: formData.branchId || undefined,
          isActive: formData.isActive,
        })
        setStaffs((prev) => prev.map((s) => (s.id === editingStaff.id ? response.metadata : s)))
      }
      setFormOpen(false)
    } catch (err) {
      setError(getErrorMessage(err, formMode === "create" ? "Không thể tạo nhân viên" : "Không thể cập nhật nhân viên"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetDialog.staff) return
    setIsResetting(true)
    setError("")
    try {
      await resetManagerStaffPassword(resetDialog.staff.id, newPassword)
      setResetDialog({ open: false, staff: null })
      setNewPassword("")
    } catch (err) {
      setError(getErrorMessage(err, "Không thể đặt lại mật khẩu"))
    } finally {
      setIsResetting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.staff) return
    setIsDeleting(true)
    setError("")
    try {
      await deleteManagerStaff(deleteDialog.staff.id)
      setStaffs((prev) => prev.filter((s) => s.id !== deleteDialog.staff!.id))
      setDeleteDialog({ open: false, staff: null })
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xóa nhân viên"))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRegenerateCode = async (staff: Staff) => {
    setIsRegenerating(true)
    setError("")
    try {
      const response = await regenerateManagerStaffCode(staff.id)
      setStaffs((prev) => prev.map((s) => (s.id === staff.id ? response.metadata : s)))
      // Nếu đang mở form sửa nhân viên này thì cập nhật editingStaff
      if (editingStaff?.id === staff.id) {
        setEditingStaff(response.metadata)
      }
      setCreatedStaffCode({ open: true, staff: response.metadata })
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tạo lại mã nhân viên"))
    } finally {
      setIsRegenerating(false)
    }
  }

  const columns = [
    {
      key: "fullName",
      label: "Nhân viên",
      render: (staff: Staff) => (
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground inline-flex mr-3">
            {staff.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-foreground">{staff.fullName}</span>
        </div>
      ),
    },
    {
      key: "staffCode",
      label: "Mã nhân viên",
      render: (staff: Staff) =>
        staff.staffCode ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-wider text-foreground">{staff.staffCode}</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigator.clipboard.writeText(staff.staffCode)}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Badge variant="outline" className="text-amber-700 border-amber-500/30 bg-amber-500/10">
            Chưa có mã
          </Badge>
        ),
    },
    { key: "email", label: "Email", render: (staff: Staff) => <span className="text-muted-foreground">{staff.email}</span> },
    { key: "phone", label: "Số điện thoại", render: (staff: Staff) => <span className="text-muted-foreground">{staff.phone || "—"}</span> },
    { key: "branch", label: "Chi nhánh", render: (staff: Staff) => <span className="text-muted-foreground">{staff.branch?.name || "Chưa gán"}</span> },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (staff: Staff) => (
        <Badge variant="outline" className={staff.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}>
          {staff.isActive ? "Đang hoạt động" : "Đã khóa"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (staff: Staff) => (
        <span className="text-sm text-muted-foreground">
          {new Date(staff.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (staff: Staff) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditForm(staff)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setResetDialog({ open: true, staff })
                setNewPassword("")
                setShowNewPassword(false)
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Đặt lại mật khẩu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRegenerateCode(staff)} disabled={isRegenerating}>
              <BadgeCheck className="mr-2 h-4 w-4" />
              {staff.staffCode ? "Tạo lại mã đăng nhập" : "Tạo mã đăng nhập"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialog({ open: true, staff })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa tài khoản
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Topbar title="Quản lý nhân viên" description="Tạo, chỉnh sửa và quản lý tài khoản đăng nhập của nhân viên." />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Tổng cộng <span className="font-semibold text-foreground">{staffs.length}</span> nhân viên
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải danh sách nhân viên...
            </div>
          ) : staffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Chưa có nhân viên nào.</p>
              <Button variant="outline" className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhân viên đầu tiên
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={staffs} searchKey="fullName" searchPlaceholder="Tìm theo tên nhân viên..." />
          )}
        </CardContent>
      </Card>

      {/* Dialog tạo / chỉnh sửa */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"}</DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Điền thông tin để tạo tài khoản nhân viên mới."
                : "Cập nhật thông tin và trạng thái tài khoản."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  className="mt-1.5"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  required
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="nhanvien@guitarhub.vn"
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1.5"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0901234567 (tùy chọn)"
                />
              </div>
              <div>
                <Label>Chi nhánh</Label>
                <Select value={formData.branchId || "none"} onValueChange={(value) => setFormData((p) => ({ ...p, branchId: value === "none" ? "" : value }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chưa gán</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formMode === "create" ? (
                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      required
                      minLength={6}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mã đăng nhập */}
                  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mã đăng nhập</p>
                    {editingStaff?.staffCode ? (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="font-mono text-lg font-bold tracking-widest text-foreground">
                          {editingStaff.staffCode}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => navigator.clipboard.writeText(editingStaff.staffCode)}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-sm text-amber-700">Chưa có mã — nhân viên không thể đăng nhập</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isRegenerating}
                          onClick={() => editingStaff && handleRegenerateCode(editingStaff)}
                        >
                          {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Tạo mã"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Trạng thái tài khoản</p>
                      <p className="text-xs text-muted-foreground">{formData.isActive ? "Đang hoạt động" : "Đã bị khóa"}</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData((p) => ({ ...p, isActive: checked }))}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : formMode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog đặt lại mật khẩu */}
      <Dialog open={resetDialog.open} onOpenChange={(open) => { if (!open) setResetDialog({ open: false, staff: null }) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho <span className="font-medium text-foreground">{resetDialog.staff?.fullName}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="py-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative mt-1.5">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword((v) => !v)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setResetDialog({ open: false, staff: null })}>
                Hủy
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : "Đặt lại mật khẩu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog hiển thị mã nhân viên mới tạo */}
      <Dialog open={createdStaffCode.open} onOpenChange={(open) => { if (!open) setCreatedStaffCode({ open: false, staff: null }) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <BadgeCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center">Tạo tài khoản thành công</DialogTitle>
            <DialogDescription className="text-center">
              Đây là mã nhân viên của <span className="font-medium text-foreground">{createdStaffCode.staff?.fullName}</span>. Lưu lại và cấp cho nhân viên để đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-5 py-4">
            <span className="font-mono text-2xl font-bold tracking-widest text-foreground">
              {createdStaffCode.staff?.staffCode}
            </span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (createdStaffCode.staff?.staffCode) {
                  navigator.clipboard.writeText(createdStaffCode.staff.staffCode)
                }
              }}
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Nhân viên dùng mã này cùng mật khẩu để đăng nhập vào hệ thống.
          </p>
          <DialogFooter className="mt-2">
            <Button className="w-full" onClick={() => setCreatedStaffCode({ open: false, staff: null })}>
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => { if (!open) setDeleteDialog({ open: false, staff: null }) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản của <span className="font-medium text-foreground">{deleteDialog.staff?.fullName}</span> ({deleteDialog.staff?.email}) sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
