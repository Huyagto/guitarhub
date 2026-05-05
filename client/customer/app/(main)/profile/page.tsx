"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { getAccessToken, getStoredUser, updateStoredUser } from "@/lib/auth"
import { getCustomerProfile, updateCustomerProfile } from "@/lib/customer-auth-api"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profileAvatar] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const accessToken = getAccessToken()
    const storedUser = getStoredUser()

    if (storedUser) {
      setProfileName(storedUser.fullName)
      setFormData({ fullName: storedUser.fullName, email: storedUser.email, phone: storedUser.phone || "" })
    }

    if (!accessToken) {
      setError("Bạn cần đăng nhập để xem thông tin tài khoản.")
      setIsProfileLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        const response = await getCustomerProfile(accessToken)
        const user = response.metadata

        updateStoredUser(user)
        setProfileName(user.fullName)
        setFormData({ fullName: user.fullName, email: user.email, phone: user.phone || "" })
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải thông tin tài khoản"))
      } finally {
        setIsProfileLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const accessToken = getAccessToken()
    if (!accessToken) {
      setError("Bạn cần đăng nhập lại để thực hiện thao tác này.")
      return
    }

    setIsLoading(true)
    try {
      const response = await updateCustomerProfile(accessToken, {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
      })
      const user = response.metadata

      updateStoredUser(user)
      setProfileName(user.fullName)
      setFormData((current) => ({ ...current, phone: user.phone || "" }))
      setSuccess("Cập nhật hồ sơ thành công.")
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể cập nhật hồ sơ"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Thông tin hồ sơ</h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin cá nhân cơ bản của bạn. Phần địa chỉ đã được chuyển sang mục riêng để dễ quản lý hơn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileAvatar ? (
                <Image
                  src={profileAvatar}
                  alt={profileName}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {profileName[0] || "U"}
                  </span>
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Đổi ảnh đại diện</span>
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Bấm vào biểu tượng máy ảnh để tải ảnh đại diện mới.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, GIF hoặc PNG. Kích thước tối đa 2MB.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                disabled={isProfileLoading}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, fullName: e.target.value }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Địa chỉ email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="mt-2 opacity-60"
              />
              <p className="mt-1 text-xs text-muted-foreground">Email không thể thay đổi.</p>
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone ?? ""}
                disabled={isProfileLoading}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, phone: e.target.value }))
                }
                className="mt-2"
                placeholder="VD: 0901234567"
              />
            </div>


          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading || isProfileLoading}>
              {isProfileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
