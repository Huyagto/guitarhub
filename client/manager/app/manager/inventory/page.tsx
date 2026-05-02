"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Branch, InventoryItem } from "@/lib/manager-types"
import { AlertTriangle, Loader2, MoreHorizontal, Package2, PackageCheck, PackageX, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { getManagerBranches, getManagerInventoryByBranch, restockManagerInventory } from "@/lib/manager-data-api"

const statusStyles = {
  "in-stock": "bg-success/10 text-success border-success/20",
  "low-stock": "bg-warning/10 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20",
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchFilter, setBranchFilter] = useState("all")
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null })
  const [restockQuantity, setRestockQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const [inventoryResponse, branchesResponse] = await Promise.all([
          getManagerInventoryByBranch(branchFilter),
          getManagerBranches(),
        ])
        setInventory(inventoryResponse.metadata)
        setBranches(branchesResponse.metadata)
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải tồn kho"))
      } finally {
        setIsLoading(false)
      }
    }

    void loadInventory()
  }, [branchFilter])

  const inStockCount = inventory.filter((item) => item.status === "in-stock").length
  const lowStockCount = inventory.filter((item) => item.status === "low-stock").length
  const outOfStockCount = inventory.filter((item) => item.status === "out-of-stock").length
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0)

  const handleRestock = async () => {
    if (!restockDialog.item || !restockQuantity) return
    try {
      const response = await restockManagerInventory(restockDialog.item.id, Number(restockQuantity))
      setInventory((prev) => prev.map((item) => (item.id === restockDialog.item?.id ? response.metadata : item)))
      setRestockDialog({ open: false, item: null })
      setRestockQuantity("")
      setError("")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể nhập thêm hàng"))
    }
  }

  const columns = [
    {
      key: "productName" as const,
      header: "Sản phẩm",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Package2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground line-clamp-1">{item.productName}</p>
            <p className="text-sm text-muted-foreground">{item.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "currentStock" as const, header: "Tồn kho hiện tại", render: (item: InventoryItem) => <span className={cn("font-medium", item.status === "out-of-stock" ? "text-destructive" : item.status === "low-stock" ? "text-warning" : "text-foreground")}>{item.currentStock}</span> },
    { key: "branchName" as const, header: "Chi nhánh", render: (item: InventoryItem) => <span className="text-muted-foreground">{item.branchName || "Chưa gán"}</span> },
    { key: "minStock" as const, header: "Tồn kho tối thiểu", render: (item: InventoryItem) => <span className="text-muted-foreground">{item.minStock}</span> },
    { key: "maxStock" as const, header: "Tồn kho tối đa", render: (item: InventoryItem) => <span className="text-muted-foreground">{item.maxStock}</span> },
    {
      key: "status" as const,
      header: "Trạng thái",
      render: (item: InventoryItem) => <Badge variant="outline" className={cn("capitalize", statusStyles[item.status])}>{item.status === "in-stock" ? "Còn hàng" : item.status === "low-stock" ? "Sắp hết hàng" : "Hết hàng"}</Badge>,
    },
    { key: "lastRestocked" as const, header: "Nhập kho gần nhất", render: (item: InventoryItem) => <span className="text-muted-foreground">{new Date(item.lastRestocked).toLocaleDateString()}</span> },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Kho hàng" description="Theo dõi và quản lý số lượng tồn kho" />
      <main className="p-6 space-y-6">
        {error ? <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
            <p className="text-2xl font-bold text-foreground">{totalStock.toLocaleString()} sản phẩm</p>
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Lọc theo chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Còn hàng</CardTitle><PackageCheck className="h-5 w-5 text-success" /></CardHeader><CardContent><p className="text-2xl font-bold text-success">{inStockCount}</p><p className="text-xs text-muted-foreground">sản phẩm đang có sẵn</p></CardContent></Card>
          <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sắp hết hàng</CardTitle><AlertTriangle className="h-5 w-5 text-warning" /></CardHeader><CardContent><p className="text-2xl font-bold text-warning">{lowStockCount}</p><p className="text-xs text-muted-foreground">cần bổ sung sớm</p></CardContent></Card>
          <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Hết hàng</CardTitle><PackageX className="h-5 w-5 text-destructive" /></CardHeader><CardContent><p className="text-2xl font-bold text-destructive">{outOfStockCount}</p><p className="text-xs text-muted-foreground">cần nhập thêm hàng</p></CardContent></Card>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">Danh sách tồn kho</h2>
              <p className="text-sm text-muted-foreground">Đang theo dõi {inventory.length} mặt hàng</p>
            </div>
            {isLoading ? <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
              <DataTable
                data={inventory}
                columns={columns}
                searchKey="productName"
                searchPlaceholder="Tìm trong kho..."
                actions={(item) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setRestockDialog({ open: true, item }); setRestockQuantity("") }}>
                        <RefreshCw className="mr-2 h-4 w-4" />Nhập thêm
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={restockDialog.open} onOpenChange={(open) => { setRestockDialog({ open, item: null }); setRestockQuantity("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập thêm hàng</DialogTitle>
            <DialogDescription>Cập nhật thêm tồn kho cho {restockDialog.item?.productName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
              <div><p className="text-sm text-muted-foreground">Tồn kho hiện tại</p><p className="text-2xl font-bold">{restockDialog.item?.currentStock}</p></div>
              <div><p className="text-sm text-muted-foreground">Mức tối thiểu</p><p className="text-2xl font-bold">{restockDialog.item?.minStock}</p></div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Số lượng nhập thêm</Label>
              <Input id="quantity" type="number" min="1" value={restockQuantity} onChange={(e) => setRestockQuantity(e.target.value)} placeholder="Nhập số lượng" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestockDialog({ open: false, item: null })}>Hủy</Button>
            <Button onClick={handleRestock} disabled={!restockQuantity}>Nhập hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
