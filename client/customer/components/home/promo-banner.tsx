import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary">
          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-24 lg:px-24 lg:py-32">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-accent">Ưu đãi có thời hạn</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Giảm đến 30% cho các mẫu guitar chọn lọc
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Nâng tầm âm thanh với bộ sưu tập guitar cao cấp của chúng tôi.
                Chất lượng chuyên nghiệp với mức giá hấp dẫn.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/shop?sale=true">
                  Mua ngay ưu đãi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 hidden h-full w-1/2 lg:block">
            <Image
              src="https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=600&fit=crop"
              alt="Guitar electric đang khuyến mãi"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
