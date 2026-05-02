import { Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/lib/types"

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
        >
          Reviews ({product.reviewCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <tbody>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <tr
                  key={key}
                  className={index % 2 === 0 ? "bg-muted/50" : "bg-background"}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground w-1/3">
                    {key}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          {/* Reviews summary */}
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">
                {product.rating}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {product.reviewCount} reviews
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-foreground">
              Chi tiết đánh giá sản phẩm đang được cập nhật.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hiện tại trang này chỉ hiển thị điểm đánh giá và số lượng review từ dữ liệu thực.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
