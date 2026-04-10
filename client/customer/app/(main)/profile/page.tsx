"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera, Loader2, ExternalLink, MapPinned, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api"
import { getAccessToken, getStoredUser, updateStoredUser } from "@/lib/auth"
import {
  getCustomerProfile,
  updateCustomerDefaultShippingAddress,
} from "@/lib/customer-auth-api"
import {
  getDefaultShippingAddress,
  saveDefaultShippingAddress,
  type StoredShippingAddress,
} from "@/lib/shipping-address"
import {
  mapOsmResultToShippingAddress,
  searchOsmAddress,
  type OsmSearchResult,
} from "@/lib/osm"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [error, setError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [addressSuccess, setAddressSuccess] = useState("")
  const [defaultAddress, setDefaultAddress] = useState(() => getDefaultShippingAddress())
  const [profileName, setProfileName] = useState("")
  const [profileAvatar] = useState("")
  const [addressQuery, setAddressQuery] = useState("")
  const [addressResults, setAddressResults] = useState<OsmSearchResult[]>([])
  const [selectedOsmResult, setSelectedOsmResult] = useState<OsmSearchResult | null>(null)
  const [fromCheckout, setFromCheckout] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })
  const [addressForm, setAddressForm] = useState({
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
  })

  const selectedLat = selectedOsmResult?.lat || defaultAddress?.lat
  const selectedLon = selectedOsmResult?.lon || defaultAddress?.lon
  const mapEmbedUrl =
    selectedLat && selectedLon
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(selectedLon) - 0.002}%2C${Number(selectedLat) - 0.002}%2C${Number(selectedLon) + 0.002}%2C${Number(selectedLat) + 0.002}&layer=mapnik&marker=${selectedLat}%2C${selectedLon}`
      : null

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setFromCheckout(params.get("from") === "checkout")
    }

    const accessToken = getAccessToken()
    const storedUser = getStoredUser()
    const storedAddress = getDefaultShippingAddress()

    if (storedUser) {
      setProfileName(storedUser.fullName)
      setFormData({
        fullName: storedUser.fullName,
        email: storedUser.email,
        phone: storedUser.phone || "",
      })
    }

    if (storedAddress) {
      hydrateAddress(storedAddress)
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

        setProfileName(user.fullName)
        setFormData({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
        })

        if (user.defaultShippingAddress) {
          hydrateAddress(user.defaultShippingAddress)
          const storedUserSnapshot = getStoredUser()
          if (storedUserSnapshot) {
            updateStoredUser({
              ...storedUserSnapshot,
              defaultShippingAddress: user.defaultShippingAddress,
            })
          }
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Không thể tải thông tin tài khoản"))
      } finally {
        setIsProfileLoading(false)
      }
    }

    void loadProfile()
  }, [])

  useEffect(() => {
    const trimmedQuery = addressQuery.trim()

    if (trimmedQuery.length < 3) {
      setAddressResults([])
      setIsSearchingAddress(false)
      setAddressError("")
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearchingAddress(true)
        setAddressError("")
        const results = await searchOsmAddress(trimmedQuery, controller.signal)
        setAddressResults(results)
      } catch (searchError) {
        if (controller.signal.aborted) return
        setAddressResults([])
        setAddressError(
          searchError instanceof Error ? searchError.message : "Không thể tìm địa chỉ"
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingAddress(false)
        }
      }
    }, 400)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [addressQuery])

  const hydrateAddress = (address: StoredShippingAddress) => {
    setDefaultAddress(address)
    setAddressQuery(address.displayName)
    setAddressForm({
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailAddress: address.detailAddress,
    })

    if (address.lat && address.lon) {
      setSelectedOsmResult({
        place_id: Number(address.id) || Date.now(),
        display_name: address.displayName,
        lat: address.lat,
        lon: address.lon,
      })
    }

    saveDefaultShippingAddress(address)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    window.alert("Backend hiện chưa có API cập nhật hồ sơ. Trang này đang kết nối API để đọc thông tin tài khoản.")
  }

  const handleSelectOsmAddress = (result: OsmSearchResult) => {
    const mappedAddress = mapOsmResultToShippingAddress(result)

    setSelectedOsmResult(result)
    setAddressQuery(result.display_name)
    setAddressResults([])
    setAddressError("")
    setAddressSuccess("")
    setAddressForm({
      ...mappedAddress,
      detailAddress: result.display_name,
    })
  }

  const handleSaveAddress = async () => {
    if (!selectedOsmResult) {
      setAddressError("Vui lòng chọn một địa chỉ từ danh sách gợi ý OpenStreetMap.")
      return
    }

    const accessToken = getAccessToken()
    const storedUser = getStoredUser()

    if (!accessToken || !storedUser) {
      setAddressError("Bạn cần đăng nhập để lưu địa chỉ.")
      return
    }

    setIsSavingAddress(true)
    setAddressError("")
    setAddressSuccess("")

    const payload: StoredShippingAddress = {
      id: String(selectedOsmResult.place_id),
      userId: String(storedUser.id),
      recipientName: formData.fullName || storedUser.fullName,
      phone: formData.phone || storedUser.phone || "",
      province: addressForm.province,
      district: addressForm.district,
      ward: addressForm.ward,
      detailAddress: addressForm.detailAddress,
      isDefault: true,
      displayName: selectedOsmResult.display_name,
      lat: selectedOsmResult.lat,
      lon: selectedOsmResult.lon,
    }

    try {
      const response = await updateCustomerDefaultShippingAddress(accessToken, payload)
      const updatedUser = response.metadata

      hydrateAddress(payload)
      updateStoredUser({
        ...storedUser,
        ...updatedUser,
        phone: formData.phone || storedUser.phone,
        defaultShippingAddress: payload,
      })
      setAddressSuccess("Đã lưu địa chỉ trong hồ sơ từ OpenStreetMap.")
    } catch (saveError) {
      setAddressError(getErrorMessage(saveError, "Không thể lưu địa chỉ"))
    } finally {
      setIsSavingAddress(false)
    }
  }

  return (
    <div className="space-y-8">
      {fromCheckout ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          Bạn cần chọn địa chỉ trong hồ sơ trước khi thanh toán.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Thông tin hồ sơ
          </h2>
          <p className="text-sm text-muted-foreground">
            Cập nhật thông tin cá nhân và địa chỉ trong hồ sơ của bạn.
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

            <div className="sm:col-span-2 border-t border-border pt-6">
              <h3 className="text-base font-semibold text-foreground">
                Địa chỉ trong hồ sơ
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Đây là địa chỉ mặc định để hệ thống dùng khi bạn vào trang thanh toán.
              </p>
            </div>

            {defaultAddress ? (
              <div className="sm:col-span-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="font-medium text-foreground">Địa chỉ hiện tại</p>
                <p className="mt-1 text-muted-foreground">
                  {defaultAddress.displayName}
                </p>
              </div>
            ) : (
              <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Bạn chưa có địa chỉ nào trong hồ sơ.
              </div>
            )}

            <div className="sm:col-span-2 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPinned className="h-4 w-4 text-accent" />
                Tìm địa chỉ với OpenStreetMap
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={addressQuery}
                  onChange={(e) => {
                    setAddressQuery(e.target.value)
                    setSelectedOsmResult(null)
                    setAddressError("")
                    setAddressSuccess("")
                  }}
                  className="pl-9"
                  placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                />
              </div>

              {isSearchingAddress ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Đang tìm địa chỉ từ OSM...
                </p>
              ) : null}

              {addressError ? (
                <p className="mt-3 text-sm text-destructive">{addressError}</p>
              ) : null}

              {addressSuccess ? (
                <p className="mt-3 text-sm text-green-600">{addressSuccess}</p>
              ) : null}

              {addressResults.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                  {addressResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      className="flex w-full items-start justify-between gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted"
                      onClick={() => handleSelectOsmAddress(result)}
                    >
                      <span className="text-sm text-foreground">
                        {result.display_name}
                      </span>
                      <span className="shrink-0 text-xs text-accent">Chọn</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {selectedOsmResult ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-background px-3 py-1 text-muted-foreground">
                    Đã chọn từ OpenStreetMap
                  </span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selectedOsmResult.lat}&mlon=${selectedOsmResult.lon}#map=18/${selectedOsmResult.lat}/${selectedOsmResult.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent/90"
                  >
                    Xem trên bản đồ
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : null}
            </div>

            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              {selectedOsmResult?.display_name || defaultAddress?.displayName || "Hãy chọn một địa chỉ từ danh sách OpenStreetMap."}
            </div>

            {mapEmbedUrl ? (
              <div className="sm:col-span-2 overflow-hidden rounded-xl border border-border">
                <iframe
                  title="Bản đồ địa chỉ"
                  src={mapEmbedUrl}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button type="button" onClick={handleSaveAddress} disabled={isSavingAddress}>
              {isSavingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu địa chỉ...
                </>
              ) : (
                "Lưu địa chỉ vào hồ sơ"
              )}
            </Button>

            <Button type="submit" variant="outline" disabled={isLoading || isProfileLoading}>
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

            {fromCheckout ? (
              <Button asChild variant="outline">
                <Link href="/checkout">Quay lại thanh toán</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
