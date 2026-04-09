"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { clearResetEmail, getResetEmail } from "@/lib/auth"
import { resetCustomerPassword, verifyCustomerOtp } from "@/lib/customer-auth-api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    const email = getResetEmail()
    if (!email) {
      setError("Thiếu email đặt lại mật khẩu. Vui lòng yêu cầu mã xác thực mới.")
      return
    }

    setIsLoading(true)

    try {
      const verifyResponse = await verifyCustomerOtp(email, formData.otp)
      await resetCustomerPassword(verifyResponse.metadata.resetToken, formData.password)
      clearResetEmail()
      setIsSuccess(true)

      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setError(getErrorMessage(error, "Đặt lại mật khẩu thất bại"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Đặt lại mật khẩu thành công
        </h2>
        <p className="mt-4 text-muted-foreground">
          Mật khẩu của bạn đã được cập nhật. Bạn sẽ sớm được chuyển về trang đăng nhập.
        </p>
        <Button asChild className="mt-8 w-full">
          <Link href="/login">Tiếp tục đăng nhập</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>
      
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Đặt lại mật khẩu
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Nhập mã xác thực được gửi tới email và chọn mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div>
          <Label htmlFor="otp">Mã xác thực</Label>
          <Input
            id="otp"
            type="text"
            required
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
            className="mt-2"
            placeholder="Nhập mã gồm 6 chữ số"
            maxLength={6}
          />
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu mới</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative mt-2">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đặt lại mật khẩu...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </div>
  )
}
