"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { clearAuthSession, getAccessToken, getStoredUser, updateStoredUser } from "@/lib/auth"
import { changeCustomerPassword, getCustomerProfile } from "@/lib/customer-auth-api"

export default function ProfilePasswordPage() {
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [canChangePassword, setCanChangePassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    let isMounted = true

    const checkPasswordSupport = async () => {
      const accessToken = getAccessToken()
      const storedUser = getStoredUser()

      if (!accessToken) {
        if (!isMounted) return
        setError("Bạn cần đăng nhập lại để sử dụng tính năng này.")
        setIsCheckingProfile(false)
        return
      }

      if (storedUser && typeof storedUser.hasPassword === "boolean") {
        if (!isMounted) return
        setCanChangePassword(storedUser.hasPassword)
        setIsCheckingProfile(false)
        return
      }

      try {
        const response = await getCustomerProfile(accessToken)
        const profile = response.metadata

        if (!isMounted) return
        updateStoredUser(profile)
        setCanChangePassword(Boolean(profile.hasPassword))
      } catch (profileError) {
        if (!isMounted) return
        setError(getErrorMessage(profileError, "Không thể kiểm tra thông tin tài khoản"))
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false)
        }
      }
    }

    checkPasswordSupport()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const accessToken = getAccessToken()
    if (!accessToken) {
      setError("Bạn cần đăng nhập lại để đổi mật khẩu.")
      return
    }

    if (!canChangePassword) {
      setError("Tài khoản đăng nhập bằng Google chưa hỗ trợ đổi mật khẩu tại đây.")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("Mật khẩu mới cần khác mật khẩu hiện tại.")
      return
    }

    setIsLoading(true)

    try {
      await changeCustomerPassword(accessToken, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      setSuccess("Đổi mật khẩu thành công. Bạn sẽ được chuyển về trang đăng nhập.")
      clearAuthSession()

      window.setTimeout(() => {
        router.replace("/login")
      }, 1500)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể đổi mật khẩu"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingProfile) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang kiểm tra quyền đổi mật khẩu...
        </div>
      </div>
    )
  }

  if (!canChangePassword) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Đổi mật khẩu</h2>
            <p className="text-sm text-muted-foreground">
              Tính năng này chỉ dành cho tài khoản đăng ký bằng email và mật khẩu.
            </p>
          </div>

          <div className="space-y-4 p-6">
            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground">
              Tài khoản của bạn đang đăng nhập bằng Google, nên hiện tại không có mục đổi mật khẩu nội bộ.
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button asChild variant="outline">
                <Link href="/profile">Quay lại hồ sơ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Đổi mật khẩu</h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn tốt hơn. Sau khi đổi xong, hệ thống sẽ yêu cầu đăng nhập lại.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-accent">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div className="text-sm text-muted-foreground">
                Tính năng này chỉ hoạt động với tài khoản đã được tạo bằng email và mật khẩu.
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          ) : null}

          <div className="space-y-5">
            <div>
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative mt-2">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword((current) => !current)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showCurrentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative mt-2">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword((current) => !current)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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
                  placeholder="Nhập lại mật khẩu mới"
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
                    {showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/profile">Quay lại hồ sơ</Link>
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
