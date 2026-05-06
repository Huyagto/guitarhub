import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 lg:w-full lg:max-w-2xl">
          <div className="relative px-6 py-24 sm:py-32 lg:px-8 lg:py-40 lg:pr-0">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <div className="hidden sm:mb-10 sm:flex">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-primary-foreground/80 ring-1 ring-primary-foreground/20">
                  Miễn phí vận chuyển cho đơn hàng trên 500 USD.{" "}
                  <Link href="/shop" className="font-semibold text-accent">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Mua ngay <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-6xl text-balance">
                Tìm Chất Âm Dành Riêng Cho Bạn
              </h1>
              <p className="mt-6 text-lg leading-8 text-primary-foreground/80 text-pretty">
                Khám phá bộ sưu tập guitar và phụ kiện cao cấp được tuyển chọn kỹ lưỡng. Từ acoustic đến electric, cây đàn phù hợp đang chờ bạn.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href="/shop">
                    Mua sắm ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <Link href="/shop?category=acoustic-guitar">
                    Xem guitar acoustic
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <Link href="/register">Tạo tài khoản</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=1000&fit=crop"
          alt="Đàn guitar acoustic"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      </div>
    </section>
  )
}
