import { notFound } from "next/navigation"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { ProductsSection } from "@/components/home/products-section"
import { getProductBySlug, getRelatedProducts, categories } from "@/lib/mock-data"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product, 4)
  const category = categories.find((c) => c.id === product.category)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Cửa hàng", href: "/shop" },
            { label: category?.name || "Sản phẩm", href: `/shop?category=${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>

        {/* Product Tabs */}
        <ProductTabs product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductsSection
          title="Sản phẩm liên quan"
          description="Có thể bạn cũng sẽ thích những mẫu guitar này"
          products={relatedProducts}
          viewAllHref={`/shop?category=${product.category}`}
          viewAllLabel="Xem tất cả"
        />
      )}
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
    }
  }

  return {
    title: `${product.name} | GuitarStore`,
    description: product.shortDescription,
  }
}
