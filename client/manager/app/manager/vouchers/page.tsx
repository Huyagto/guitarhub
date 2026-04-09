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
import { vouchers as initialVouchers, type Voucher } from "@/lib/mock-data"
import { Plus, MoreHorizontal, Pencil, Trash2, Ticket, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  expired: "bg-muted text-muted-foreground border-muted",
  disabled: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; voucher: Voucher | null }>({
    open: false,
    voucher: null,
  })
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    usageLimit: "",
    expiresAt: "",
  })

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      usageLimit: "",
      expiresAt: "",
    })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVoucher) {
      setVouchers(
        vouchers.map((v) =>
          v.id === editingVoucher.id
            ? {
                ...v,
                code: formData.code,
                type: formData.type,
                value: parseInt(formData.value),
                minPurchase: parseInt(formData.minPurchase),
                usageLimit: parseInt(formData.usageLimit),
                expiresAt: formData.expiresAt,
              }
            : v
        )
      )
    } else {
      const newVoucher: Voucher = {
        id: String(vouchers.length + 1),
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseInt(formData.value),
        minPurchase: parseInt(formData.minPurchase),
        usageLimit: parseInt(formData.usageLimit),
        usedCount: 0,
        status: "active",
        expiresAt: formData.expiresAt,
      }
      setVouchers([newVoucher, ...vouchers])
    }
    setFormOpen(false)
    resetForm()
  }

  const handleDelete = () => {
    if (!deleteDialog.voucher) return
    setVouchers(vouchers.filter((v) => v.id !== deleteDialog.voucher!.id))
    setDeleteDialog({ open: false, voucher: null })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const columns = [
    {
      key: "code" as const,
      header: "Code",
      render: (voucher: Voucher) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Ticket className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-foreground">{voucher.code}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyCode(voucher.code)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "value" as const,
      header: "Discount",
      render: (voucher: Voucher) => (
        <span className="font-medium text-primary">
          {voucher.type === "percentage" ? `${voucher.value}%` : `$${voucher.value}`}
        </span>
      ),
    },
    {
      key: "minPurchase" as const,
      header: "Min Purchase",
      render: (voucher: Voucher) => (
        <span className="text-muted-foreground">${voucher.minPurchase}</span>
      ),
    },
    {
      key: "usage" as const,
      header: "Usage",
      render: (voucher: Voucher) => (
        <span className="text-muted-foreground">
          {voucher.usedCount} / {voucher.usageLimit === 0 ? "Unlimited" : voucher.usageLimit}
        </span>
      ),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (voucher: Voucher) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[voucher.status])}>
          {voucher.status}
        </Badge>
      ),
    },
    {
      key: "expiresAt" as const,
      header: "Expires",
      render: (voucher: Voucher) => (
        <span className="text-muted-foreground">
          {new Date(voucher.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Vouchers" description="Manage discount codes and promotions" />

      <main className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">All Vouchers</h2>
                <p className="text-sm text-muted-foreground">
                  {vouchers.filter((v) => v.status === "active").length} active vouchers
                </p>
              </div>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Voucher
              </Button>
            </div>

            <DataTable
              data={vouchers}
              columns={columns}
              searchKey="code"
              searchPlaceholder="Search vouchers..."
              actions={(voucher) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenForm(voucher)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteDialog({ open: true, voucher })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>
      </main>

      {/* Voucher Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVoucher ? "Edit Voucher" : "Create New Voucher"}</DialogTitle>
            <DialogDescription>
              {editingVoucher ? "Update voucher details below." : "Create a new discount voucher."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Voucher Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER2024"
                  className="font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "percentage" | "fixed" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "e.g. 15" : "e.g. 50"}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minPurchase">Min Purchase ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="0 for unlimited"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingVoucher ? "Update" : "Create"} Voucher</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, voucher: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete voucher &quot;{deleteDialog.voucher?.code}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
