"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  MapPinned,
  Search,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/mock-data"
import type { PaymentMethod } from "@/lib/types"
import {
  mapOsmResultToShippingAddress,
  searchOsmAddress,
  type OsmSearchResult,
} from "@/lib/osm"

const paymentMethods = [
  {
    id: "cod" as PaymentMethod,
    name: "Thanh toán khi nhận hàng",
    description: "Thanh toán khi bạn nhận được đơn hàng",
    icon: Banknote,
  },
  {
    id: "vnpay" as PaymentMethod,
    name: "VNPay",
    description: "Thanh toán bằng ví điện tử VNPay",
    icon: CreditCard,
  },
  {
    id: "momo" as PaymentMethod,
    name: "MoMo",
    description: "Thanh toán bằng ví điện tử MoMo",
    icon: Wallet,
  },
  {
    id: "zalopay" as PaymentMethod,
    name: "ZaloPay",
    description: "Thanh toán bằng ví điện tử ZaloPay",
    icon: Smartphone,
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [addressError, setAddressError] = useState("")
  const [addressQuery, setAddressQuery] = useState("")
  const [addressResults, setAddressResults] = useState<OsmSearchResult[]>([])
  const [selectedOsmResult, setSelectedOsmResult] = useState<OsmSearchResult | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
  })

  const shippingFee = subtotal >= 500 ? 0 : 25
  const total = subtotal + shippingFee

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
      } catch (error) {
        if (controller.signal.aborted) return
        setAddressResults([])
        setAddressError(
          error instanceof Error ? error.message : "Không thể tìm địa chỉ"
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

  const handleSelectOsmAddress = (result: OsmSearchResult) => {
    const mappedAddress = mapOsmResultToShippingAddress(result)

    setSelectedOsmResult(result)
    setAddressQuery(result.display_name)
    setAddressResults([])
    setAddressError("")
    setShippingInfo((prev) => ({
      ...prev,
      ...mappedAddress,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    clearCart()
    router.push("/checkout/success")
  }

  if (items.length === 0) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <BreadcrumbNav
            items={[
              { label: "Giỏ hàng", href: "/cart" },
              { label: "Thanh toán" },
            ]}
          />
          <div className="mt-16 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="mt-2 text-muted-foreground">
              Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Giỏ hàng", href: "/cart" },
            { label: "Thanh toán" },
          ]}
        />

        <div className="mt-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Thanh toán
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Địa chỉ giao hàng
                </h2>

                <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPinned className="h-4 w-4 text-accent" />
                    Tìm địa chỉ với OpenStreetMap
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nhập tên đường, khu vực hoặc địa chỉ gần đúng. Chọn một gợi ý để tự điền thông tin giao hàng.
                  </p>

                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={addressQuery}
                      onChange={(e) => {
                        setAddressQuery(e.target.value)
                        setSelectedOsmResult(null)
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
                          <span className="shrink-0 text-xs text-accent">
                            Chọn
                          </span>
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

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="recipientName">Người nhận</Label>
                    <Input
                      id="recipientName"
                      required
                      value={shippingInfo.recipientName}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          recipientName: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="Họ và tên"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, phone: e.target.value })
                      }
                      className="mt-2"
                      placeholder="0901 234 567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province">Tỉnh / Thành phố</Label>
                    <Input
                      id="province"
                      required
                      value={shippingInfo.province}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          province: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district">Quận / Huyện</Label>
                    <Input
                      id="district"
                      required
                      value={shippingInfo.district}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          district: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="Quận 1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ward">Phường / Xã</Label>
                    <Input
                      id="ward"
                      required
                      value={shippingInfo.ward}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, ward: e.target.value })
                      }
                      className="mt-2"
                      placeholder="Phường Bến Nghé"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="detailAddress">Địa chỉ chi tiết</Label>
                    <Input
                      id="detailAddress"
                      required
                      value={shippingInfo.detailAddress}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          detailAddress: e.target.value,
                        })
                      }
                      className="mt-2"
                      placeholder="123 Đường Âm Nhạc, tầng 4"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Phương thức thanh toán
                </h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="mt-6 grid gap-3 sm:grid-cols-2"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.id}
                        className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-border p-4 transition-colors hover:bg-muted peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                      >
                        <method.icon className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {method.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Tóm tắt đơn hàng
                </h2>

                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    <span className="font-medium text-foreground">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">
                      Tổng cộng
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Thanh toán an toàn
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
