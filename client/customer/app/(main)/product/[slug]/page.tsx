import { notFound } from "next/navigation"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductTabs } from "@/components/product/product-tabs"
import { ProductsSection } from "@/components/home/products-section"
import {
  getCatalogCategories,
  getCatalogProductBySlug,
  getRelatedCatalogProducts,
} from "@/lib/catalog-api"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  try {
    const [product, relatedProducts, categories] = await Promise.all([
      getCatalogProductBySlug(slug),
      getRelatedCatalogProducts(slug),
      getCatalogCategories(),
    ])

    const category = categories.find((item) => item.id === product.category)

    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <BreadcrumbNav
            items={[
              { label: "Cửa hàng", href: "/shop" },
              {
                label: category?.name || product.categoryName || "Sản phẩm",
                href: `/shop?category=${product.category}`,
              },
              { label: product.name },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <ProductGallery images={product.images} productName={product.name} />
            <ProductInfo product={product} />
          </div>

          <ProductTabs product={product} />
        </div>

        {relatedProducts.length > 0 && (
          <ProductsSection
            title="Sản phẩm liên quan"
            description="Những mẫu guitar và phụ kiện có thể phù hợp với lựa chọn của bạn."
            products={relatedProducts}
            viewAllHref={`/shop?category=${product.category}`}
            viewAllLabel="Xem tất cả"
          />
        )}
      </div>
    )
  } catch {
    notFound()
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params

  try {
    const product = await getCatalogProductBySlug(slug)
    return {
      title: `${product.name} | GuitarHub`,
      description: product.shortDescription,
    }
  } catch {
    return {
      title: "Không tìm thấy sản phẩm",
    }
  }
}
