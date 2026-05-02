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
import { registerCustomer } from "@/lib/customer-auth-api"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [termsError, setTermsError] = useState("")
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
        password: formData.password,
      })

      router.push("/login")
    } catch (error) {
      setError(getErrorMessage(error, "Tạo tài khoản thất bại"))
    } finally {
      setIsLoading(false)
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

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

        <Button type="submit" className="w-full" disabled={isLoading}>
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
    </div>
  )
}
