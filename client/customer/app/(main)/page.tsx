import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { ProductsSection } from "@/components/home/products-section"
import { PromoBanner } from "@/components/home/promo-banner"
import { BrandHighlights } from "@/components/home/brand-highlights"
import {
  getBestSellerProducts,
  getCatalogCategories,
  getNewArrivalProducts,
} from "@/lib/catalog-api"

export default async function HomePage() {
  const [bestSellersResult, newArrivalsResult, categoriesResult] = await Promise.allSettled([
    getBestSellerProducts(),
    getNewArrivalProducts(),
    getCatalogCategories(),
  ])

  const bestSellers =
    bestSellersResult.status === "fulfilled" ? bestSellersResult.value : []
  const newArrivals =
    newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value : []
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : []

  return (
    <>
      <HeroSection />
      <BrandHighlights />
      <CategoriesSection categories={categories} />
      <ProductsSection
        title="Sản phẩm bán chạy"
        description="Những mẫu đàn được khách hàng yêu thích và lựa chọn nhiều nhất."
        products={bestSellers.slice(0, 4)}
        viewAllHref="/shop?sort=best-selling"
        viewAllLabel="Xem tất cả"
      />
      <PromoBanner />
      <ProductsSection
        title="Sản phẩm mới"
        description="Các mẫu đàn và phụ kiện vừa cập bến tại GuitarHub."
        products={newArrivals.slice(0, 4)}
        viewAllHref="/shop?sort=latest"
        viewAllLabel="Xem tất cả"
      />
    </>
  )
}
