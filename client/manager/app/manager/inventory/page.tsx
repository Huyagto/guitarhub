"use client"

import { useState } from "react"
import { Topbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { inventory as initialInventory, type InventoryItem } from "@/lib/mock-data"
import { MoreHorizontal, Package2, AlertTriangle, PackageCheck, PackageX, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const statusStyles = {
  "in-stock": "bg-success/10 text-success border-success/20",
  "low-stock": "bg-warning/10 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20",
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; item: InventoryItem | null }>({
    open: false,
    item: null,
  })
  const [restockQuantity, setRestockQuantity] = useState("")

  const inStockCount = inventory.filter((i) => i.status === "in-stock").length
  const lowStockCount = inventory.filter((i) => i.status === "low-stock").length
  const outOfStockCount = inventory.filter((i) => i.status === "out-of-stock").length

  const handleRestock = () => {
    if (!restockDialog.item || !restockQuantity) return
    
    const quantity = parseInt(restockQuantity)
    const newStock = restockDialog.item.currentStock + quantity
    
    setInventory(
      inventory.map((item) =>
        item.id === restockDialog.item!.id
          ? {
              ...item,
              currentStock: newStock,
              status:
                newStock === 0
                  ? "out-of-stock"
                  : newStock < item.minStock
                  ? "low-stock"
                  : "in-stock",
              lastRestocked: new Date().toISOString().split("T")[0],
            }
          : item
      )
    )
    setRestockDialog({ open: false, item: null })
    setRestockQuantity("")
  }

  const columns = [
    {
      key: "productName" as const,
      header: "Product",
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
    {
      key: "currentStock" as const,
      header: "Current Stock",
      render: (item: InventoryItem) => (
        <span
          className={cn(
            "font-medium",
            item.status === "out-of-stock"
              ? "text-destructive"
              : item.status === "low-stock"
              ? "text-warning"
              : "text-foreground"
          )}
        >
          {item.currentStock}
        </span>
      ),
    },
    {
      key: "minStock" as const,
      header: "Min Stock",
      render: (item: InventoryItem) => (
        <span className="text-muted-foreground">{item.minStock}</span>
      ),
    },
    {
      key: "maxStock" as const,
      header: "Max Stock",
      render: (item: InventoryItem) => (
        <span className="text-muted-foreground">{item.maxStock}</span>
      ),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (item: InventoryItem) => (
        <Badge variant="outline" className={cn("capitalize", statusStyles[item.status])}>
          {item.status.replace("-", " ")}
        </Badge>
      ),
    },
    {
      key: "lastRestocked" as const,
      header: "Last Restocked",
      render: (item: InventoryItem) => (
        <span className="text-muted-foreground">
          {new Date(item.lastRestocked).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Topbar title="Inventory" description="Track and manage stock levels" />

      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
              <PackageCheck className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{inStockCount}</p>
              <p className="text-xs text-muted-foreground">products available</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">need attention</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <PackageX className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
              <p className="text-xs text-muted-foreground">require restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">Inventory Items</h2>
              <p className="text-sm text-muted-foreground">
                {inventory.length} items tracked
              </p>
            </div>

            <DataTable
              data={inventory}
              columns={columns}
              searchKey="productName"
              searchPlaceholder="Search inventory..."
              actions={(item) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setRestockDialog({ open: true, item })
                        setRestockQuantity("")
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restock
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </CardContent>
        </Card>
      </main>

      {/* Restock Dialog */}
      <Dialog
        open={restockDialog.open}
        onOpenChange={(open) => {
          setRestockDialog({ open, item: null })
          setRestockQuantity("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock for {restockDialog.item?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{restockDialog.item?.currentStock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min Required</p>
                <p className="text-2xl font-bold">{restockDialog.item?.minStock}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRestockDialog({ open: false, item: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={!restockQuantity}>
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
