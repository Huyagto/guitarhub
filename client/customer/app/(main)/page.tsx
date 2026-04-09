import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { ProductsSection } from "@/components/home/products-section"
import { PromoBanner } from "@/components/home/promo-banner"
import { BrandHighlights } from "@/components/home/brand-highlights"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { NewsletterSection } from "@/components/home/newsletter-section"
import { getBestSellers, getNewArrivals } from "@/lib/mock-data"

export default function HomePage() {
  const bestSellers = getBestSellers().slice(0, 4)
  const newArrivals = getNewArrivals().slice(0, 4)

  return (
    <>
      <HeroSection />
      <BrandHighlights />
      <CategoriesSection />
      <ProductsSection
        title="Best Sellers"
        description="Our most popular guitars loved by musicians worldwide."
        products={bestSellers}
        viewAllHref="/shop?sort=best-selling"
        viewAllLabel="View all best sellers"
      />
      <PromoBanner />
      <ProductsSection
        title="New Arrivals"
        description="The latest additions to our collection."
        products={newArrivals}
        viewAllHref="/shop?sort=latest"
        viewAllLabel="View all new arrivals"
      />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
