"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2 } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission
    setSubmitted(true)
    setEmail("")
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-accent/10 px-8 py-16 sm:px-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
              <Mail className="h-7 w-7 text-accent" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Luôn Bắt Kịp Nhịp Điệu
            </h2>
            <p className="mt-4 text-muted-foreground">
              Đăng ký nhận tin để cập nhật ưu đãi độc quyền, sản phẩm mới và mẹo chơi guitar từ người có kinh nghiệm.
            </p>
            
            {submitted ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-accent">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Cảm ơn bạn đã đăng ký!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="sm:w-80"
                />
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Đăng ký
                </Button>
              </form>
            )}
            
            <p className="mt-4 text-xs text-muted-foreground">
              Khi đăng ký, bạn đồng ý với Chính sách bảo mật của chúng tôi. Có thể hủy bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
