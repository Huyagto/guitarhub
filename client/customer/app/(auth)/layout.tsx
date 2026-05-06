import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Guitar<span className="text-accent">Hub</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=1600&fit=crop"
          alt="Bộ sưu tập guitar"
          fill
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Chào mừng đến với GuitarHub
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Điểm đến dành cho guitar và phụ kiện cao cấp. Cùng tham gia cộng đồng yêu nhạc của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
