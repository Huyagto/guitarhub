"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Loader2, MapPinned, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function ProfileAddressesPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [error, setError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [addressSuccess, setAddressSuccess] = useState("")
  const [defaultAddress, setDefaultAddress] = useState<StoredShippingAddress | null>(null)
  const [addressQuery, setAddressQuery] = useState("")
  const [addressResults, setAddressResults] = useState<OsmSearchResult[]>([])
  const [selectedOsmResult, setSelectedOsmResult] = useState<OsmSearchResult | null>(null)
  const [fromCheckout, setFromCheckout] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
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
    setHasMounted(true)

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setFromCheckout(params.get("from") === "checkout")
    }

    const accessToken = getAccessToken()
    const storedUser = getStoredUser()
    const storedAddress = getDefaultShippingAddress()

    if (storedUser) {
      setContactInfo({
        fullName: storedUser.fullName,
        phone: storedUser.phone || "",
      })
    }

    if (storedAddress) {
      hydrateAddress(storedAddress)
    }

    if (!accessToken) {
      setError("Bạn cần đăng nhập để quản lý địa chỉ.")
      setIsProfileLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        const response = await getCustomerProfile(accessToken)
        const user = response.metadata

        setContactInfo({
          fullName: user.fullName,
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
        setError(getErrorMessage(loadError, "Không thể tải sổ địa chỉ"))
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
      recipientName: contactInfo.fullName || storedUser.fullName,
      phone: contactInfo.phone || storedUser.phone || "",
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
        phone: contactInfo.phone || storedUser.phone,
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
          <h2 className="text-lg font-semibold text-foreground">Địa chỉ đã lưu</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý địa chỉ mặc định mà hệ thống sẽ dùng khi bạn vào trang thanh toán.
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-6">
            {hasMounted && defaultAddress ? (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="font-medium text-foreground">Địa chỉ hiện tại</p>
                <p className="mt-1 text-muted-foreground">{defaultAddress.displayName}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Bạn chưa có địa chỉ nào trong hồ sơ.
              </div>
            )}

            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
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
                <p className="mt-3 text-sm text-muted-foreground">Đang tìm địa chỉ từ OSM...</p>
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
                      <span className="text-sm text-foreground">{result.display_name}</span>
                      <span className="shrink-0 text-xs text-accent">Chọn</span>
                    </button>
                  ))}
                </div>
              ) : null}

            </div>

            {hasMounted && mapEmbedUrl ? (
              <div className="overflow-hidden rounded-xl border border-border">
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

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" onClick={handleSaveAddress} disabled={isSavingAddress || isProfileLoading}>
              {isSavingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu địa chỉ...
                </>
              ) : (
                "Lưu địa chỉ vào hồ sơ"
              )}
            </Button>

            {fromCheckout ? (
              <Button asChild variant="outline">
                <Link href="/checkout">Quay lại thanh toán</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
