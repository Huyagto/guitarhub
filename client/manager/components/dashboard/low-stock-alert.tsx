"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { inventory } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function LowStockAlert() {
  const lowStockItems = inventory.filter(
    (item) => item.status === "low-stock" || item.status === "out-of-stock"
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-card-foreground">Low Stock Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
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
                {item.currentStock} / {item.minStock} min
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
