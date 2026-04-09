"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockAddresses } from "@/lib/mock-data"
import { getErrorMessage } from "@/lib/api"
import { getAccessToken, getStoredUser } from "@/lib/auth"
import { getCustomerProfile } from "@/lib/customer-auth-api"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [error, setError] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profileAvatar] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  const defaultAddress = mockAddresses.find((a) => a.isDefault)

  useEffect(() => {
    const accessToken = getAccessToken()
    const storedUser = getStoredUser()

    if (storedUser) {
      setProfileName(storedUser.fullName)
      setFormData({
        fullName: storedUser.fullName,
        email: storedUser.email,
        phone: storedUser.phone || "",
      })
    }

    if (!accessToken) {
      setError("Bạn cần đăng nhập để xem thông tin tài khoản.")
      setIsProfileLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        const response = await getCustomerProfile(accessToken)
        setProfileName(response.metadata.fullName)
        setFormData({
          fullName: response.metadata.fullName,
          email: response.metadata.email,
          phone: response.metadata.phone || "",
        })
      } catch (error) {
        setError(getErrorMessage(error, "Không thể tải thông tin tài khoản"))
      } finally {
        setIsProfileLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    alert("Backend hiện chưa có API cập nhật hồ sơ. Trang này đang kết nối API để đọc thông tin tài khoản.")
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Personal Information */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Thông tin cá nhân
          </h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin cá nhân và tuỳ chọn của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Avatar */}
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
              <p className="text-xs text-muted-foreground mt-1">
                JPG, GIF hoặc PNG. Kích thước tối đa 2MB.
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                disabled={isProfileLoading}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
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
                disabled={isProfileLoading}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                disabled={isProfileLoading}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-2"
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

      {/* Default Shipping Address */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Địa chỉ giao hàng mặc định
          </h2>
        </div>

        <div className="p-6">
          {defaultAddress ? (
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {defaultAddress.recipientName}
              </p>
              <p className="mt-1 text-muted-foreground">
                {defaultAddress.phone}
              </p>
              <p className="mt-1 text-muted-foreground">
                {defaultAddress.detailAddress}, {defaultAddress.ward},{" "}
                {defaultAddress.district}, {defaultAddress.province}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có địa chỉ mặc định.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
