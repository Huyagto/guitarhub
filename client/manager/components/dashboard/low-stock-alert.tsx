"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { InventoryItem } from "@/lib/manager-types"
import { cn } from "@/lib/utils"

interface LowStockAlertProps {
  items: InventoryItem[]
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-card-foreground">Cảnh báo tồn kho thấp</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  item.status === "out-of-stock"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-warning/10 text-warning border-warning/20"
                )}
              >
                {item.currentStock} / {item.minStock} tối thiểu
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
