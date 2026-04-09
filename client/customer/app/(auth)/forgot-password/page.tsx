"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { setResetEmail } from "@/lib/auth"
import { forgotCustomerPassword } from "@/lib/customer-auth-api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await forgotCustomerPassword(email)
      setResetEmail(email)
      setIsSubmitted(true)
    } catch (error) {
      setError(getErrorMessage(error, "Không thể gửi mã OTP"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Kiểm tra email của bạn
        </h2>
        <p className="mt-4 text-muted-foreground">
          Chúng tôi đã gửi mã xác thực đến{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Chưa nhận được email? Hãy kiểm tra thư rác hoặc{" "}
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-accent hover:text-accent/90"
          >
            thử lại
          </button>
        </p>
        <Button asChild className="mt-8 w-full">
          <Link href="/reset-password">Tiếp tục đặt lại mật khẩu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>
      
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Quên mật khẩu?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Đừng lo, hãy nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div>
          <Label htmlFor="email">Địa chỉ email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2"
            placeholder="ban@example.com"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi OTP...
            </>
          ) : (
            "Gửi mã xác thực"
          )}
        </Button>
      </form>
    </div>
  )
}
