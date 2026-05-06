"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getErrorMessage } from "@/lib/api"
import { getCustomerGoogleAuthUrl, registerCustomer, verifyCustomerRegistration } from "@/lib/customer-auth-api"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [termsError, setTermsError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const handleTermsChange = (checked: boolean) => {
    setFormData((current) => ({ ...current, agreeTerms: checked }))
    if (checked) {
      setTermsError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTermsError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    if (!formData.agreeTerms) {
      setTermsError("Vui lòng đồng ý với điều khoản trước khi tạo tài khoản.")
      return
    }

    setIsLoading(true)

    try {
      await registerCustomer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      setRegisteredEmail(formData.email)
      setOtpSent(true)
      setError("")
    } catch (error) {
      setError(getErrorMessage(error, "Tạo tài khoản thất bại"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await verifyCustomerRegistration(registeredEmail || formData.email, otp)
      router.push("/login")
    } catch (error) {
      setError(getErrorMessage(error, "Xác thực OTP thất bại"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError("")
    setTermsError("")
    setIsGoogleLoading(true)

    try {
      const response = await getCustomerGoogleAuthUrl()
      window.location.href = response.metadata.url
    } catch (error) {
      setError(getErrorMessage(error, "Không thể bắt đầu đăng ký bằng Google"))
      setIsGoogleLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Tạo tài khoản
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent/90">
          Đăng nhập
        </Link>
      </p>

      <div className="mt-8 space-y-5">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Đăng ký bằng Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Hoặc đăng ký bằng email</span>
          </div>
        </div>
      </div>

      {otpSent ? (
        <form onSubmit={handleVerifyOtp} className="mt-5 space-y-5">
          {error ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Mã OTP đã được gửi đến {registeredEmail || formData.email}. Nhập mã gồm 6 chữ số để hoàn tất đăng ký.
          </div>
          <div>
            <Label htmlFor="otp">Mã OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2"
              placeholder="Nhập mã gồm 6 chữ số"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Hoàn tất đăng ký"
            )}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)} disabled={isLoading}>
            Sửa thông tin đăng ký
          </Button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div>
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData((current) => ({ ...current, fullName: e.target.value }))
            }
            className="mt-2"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <Label htmlFor="email">Địa chỉ email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData((current) => ({ ...current, email: e.target.value }))
            }
            className="mt-2"
            placeholder="ban@example.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((current) => ({ ...current, phone: e.target.value }))
            }
            className="mt-2"
            placeholder="0901 234 567"
          />
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData((current) => ({ ...current, password: e.target.value }))
              }
              placeholder="Tạo mật khẩu"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              </span>
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative mt-2">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className={`rounded-xl border p-3 transition-colors ${
              termsError
                ? "border-destructive/40 bg-destructive/5"
                : "border-border/70 bg-muted/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleTermsChange(checked === true)}
                aria-invalid={Boolean(termsError)}
                className="mt-0.5"
              />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm leading-5 text-foreground">
                  <Label
                    htmlFor="terms"
                    className="cursor-pointer font-normal leading-5 text-foreground"
                  >
                    Tôi đồng ý với
                  </Label>
                  <Link href="/terms" className="font-medium text-accent hover:text-accent/90">
                    Điều khoản dịch vụ
                  </Link>
                  <span>và</span>
                  <Link
                    href="/privacy"
                    className="font-medium text-accent hover:text-accent/90"
                  >
                    Chính sách bảo mật
                  </Link>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Bạn cần xác nhận mục này trước khi tạo tài khoản.
                </p>
              </div>
            </div>
          </div>

          {termsError ? (
            <p className="text-sm text-destructive">{termsError}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>
      )}
    </div>
  )
}
