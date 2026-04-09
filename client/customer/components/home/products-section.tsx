import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/types"

interface ProductsSectionProps {
  title: string
  description?: string
  products: Product[]
  viewAllHref: string
  viewAllLabel?: string
}

export function ProductsSection({
  title,
  description,
  products,
  viewAllHref,
  viewAllLabel = "Xem tất cả",
}: ProductsSectionProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          <Button variant="link" asChild className="text-accent">
            <Link href={viewAllHref}>
              {viewAllLabel}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
