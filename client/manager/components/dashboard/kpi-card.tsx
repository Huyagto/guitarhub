import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change: number
  icon: LucideIcon
  prefix?: string
}

export function KpiCard({ title, value, change, icon: Icon, prefix = "" }: KpiCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-card-foreground">
              {prefix}{value}
            </p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-primary" : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-sm text-muted-foreground">so với tháng trước</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
