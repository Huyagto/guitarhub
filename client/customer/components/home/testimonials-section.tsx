import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { testimonials } from "@/lib/mock-data"

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Hàng ngàn người yêu nhạc đã tin tưởng GuitarStore khi chọn mua nhạc cụ cho mình.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-2xl bg-card p-8 shadow-sm"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-muted-foreground/20" />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-foreground">{testimonial.comment}</p>
              <div className="mt-6 flex items-center gap-4">
                {testimonial.avatar && (
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
