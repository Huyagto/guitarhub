"use client"

import { useCallback, useEffect, useState } from "react"
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
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { getAccessToken, getStoredUser } from "@/lib/auth"
import type { PaymentMethod } from "@/lib/types"
import { getDefaultShippingAddress } from "@/lib/shipping-address"
import { createCheckout, getAvailableCheckoutBranches, previewCheckout, type AvailableBranch, type CheckoutPreview } from "@/lib/checkout-api"

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
  const [submitError, setSubmitError] = useState("")
  const [branches, setBranches] = useState<AvailableBranch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherInput, setVoucherInput] = useState("")
  const [voucherError, setVoucherError] = useState("")
  const [preview, setPreview] = useState<CheckoutPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [shippingInfoOpen, setShippingInfoOpen] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
    displayName: "",
    lat: "",
    lon: "",
  })

  const mapEmbedUrl =
    shippingInfo.lat && shippingInfo.lon
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(shippingInfo.lon) - 0.002}%2C${Number(shippingInfo.lat) - 0.002}%2C${Number(shippingInfo.lon) + 0.002}%2C${Number(shippingInfo.lat) + 0.002}&layer=mapnik&marker=${shippingInfo.lat}%2C${shippingInfo.lon}`
      : null

  useEffect(() => {
    const storedUser = getStoredUser()
    const storedAddress = getDefaultShippingAddress()

    if (storedUser) {
      setShippingInfo((prev) => ({
        ...prev,
        recipientName: storedUser.fullName || "",
        phone: storedUser.phone || "",
      }))
    }

    if (!storedAddress) {
      router.replace("/profile/addresses?from=checkout")
      return
    }

    setShippingInfo((prev) => ({
      ...prev,
      province: storedAddress.province,
      district: storedAddress.district,
      ward: storedAddress.ward,
      detailAddress: storedAddress.detailAddress,
      displayName: storedAddress.displayName,
      lat: storedAddress.lat || "",
      lon: storedAddress.lon || "",
    }))
  }, [router])

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoadingBranches(true)
      try {
        const availableBranches = await getAvailableCheckoutBranches(
          items.map((item) => item.product.id),
          { lat: shippingInfo.lat, lon: shippingInfo.lon }
        )
        setBranches(availableBranches)
        const fulfillableBranches = availableBranches.filter((branch) =>
          items.every((item) => {
            const inventory = branch.inventory.find((entry) => entry.productId === item.product.id)
            return Boolean(inventory && inventory.stock >= item.quantity)
          })
        )
        setSelectedBranchId((current) =>
          fulfillableBranches.some((branch) => branch.id === current) ? current : fulfillableBranches[0]?.id || ""
        )
      } catch {
        setBranches([])
      } finally {
        setIsLoadingBranches(false)
      }
    }

    if (items.length) {
      void loadBranches()
    }
  }, [items, shippingInfo.lat, shippingInfo.lon])

  const fetchPreview = useCallback(async (branchId: string, code: string) => {
    if (!branchId || !shippingInfo.lat || !shippingInfo.lon) return
    setIsLoadingPreview(true)
    setVoucherError("")
    try {
      const result = await previewCheckout({
        branchId,
        voucherCode: code || undefined,
        shippingInfo: { lat: shippingInfo.lat, lon: shippingInfo.lon },
      })
      setPreview(result)
    } catch (err) {
      if (code) {
        setVoucherError(err instanceof Error ? err.message : "Mã giảm giá không hợp lệ")
        // retry without voucher to show correct shipping fee
        try {
          const result = await previewCheckout({
            branchId,
            shippingInfo: { lat: shippingInfo.lat, lon: shippingInfo.lon },
          })
          setPreview(result)
        } catch {
          setPreview(null)
        }
      } else {
        setPreview(null)
      }
    } finally {
      setIsLoadingPreview(false)
    }
  }, [shippingInfo.lat, shippingInfo.lon])

  useEffect(() => {
    if (selectedBranchId) {
      void fetchPreview(selectedBranchId, voucherCode)
    }
  }, [selectedBranchId, voucherCode, fetchPreview])

  const handleApplyVoucher = () => {
    setVoucherCode(voucherInput)
    void fetchPreview(selectedBranchId, voucherInput)
  }

  const branchCanFulfillCart = (branch: AvailableBranch) =>
    items.every((item) => {
      const inventory = branch.inventory.find((entry) => entry.productId === item.product.id)
      return Boolean(inventory && inventory.stock >= item.quantity)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const storedAddress = getDefaultShippingAddress()
    if (!storedAddress) {
      router.replace("/profile/addresses?from=checkout")
      return
    }

    setIsLoading(true)
    setSubmitError("")

    try {
      if (!getAccessToken()) {
        throw new Error("Vui lòng đăng nhập để thanh toán")
      }

      if (!selectedBranchId) {
        throw new Error("Vui lòng chọn chi nhánh còn đủ hàng")
      }

      if (!shippingInfo.lat || !shippingInfo.lon) {
        throw new Error("Vui lòng cập nhật địa chỉ giao hàng có định vị trước khi thanh toán")
      }

      const checkout = await createCheckout({
        paymentMethod,
        branchId: selectedBranchId,
        voucherCode: voucherCode.trim() || undefined,
        shippingInfo: {
          recipientName: shippingInfo.recipientName,
          phone: shippingInfo.phone,
          province: shippingInfo.province,
          district: shippingInfo.district,
          ward: shippingInfo.ward,
          detailAddress: shippingInfo.detailAddress,
          displayName: shippingInfo.displayName,
          lat: shippingInfo.lat,
          lon: shippingInfo.lon,
        },
      })

      if (checkout.paymentUrl) {
        window.location.href = checkout.paymentUrl
        return
      }

      if (checkout.redirectUrl) {
        await clearCart()
        router.push(checkout.redirectUrl.replace(/^https?:\/\/[^/]+/, ""))
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể khởi tạo thanh toán"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDistance = (distanceKm: number | null) => {
    if (distanceKm === null) return "Chưa có khoảng cách"
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`
    return `${distanceKm.toFixed(1)} km`
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
              <div className="rounded-xl border border-border p-4">
                <h2 className="text-sm font-semibold text-foreground">Chi nhánh xử lý đơn</h2>

                {isLoadingBranches ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang kiểm tra tồn kho...
                  </div>
                ) : branches.length === 0 ? (
                  <p className="mt-2 text-xs text-destructive">
                    Hiện chưa có chi nhánh nào đủ hàng.
                  </p>
                ) : (
                  <RadioGroup value={selectedBranchId} onValueChange={setSelectedBranchId} className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {branches.map((branch) => {
                      const canFulfill = branchCanFulfillCart(branch)
                      const isSelected = selectedBranchId === branch.id

                      return (
                        <div key={branch.id} className="shrink-0">
                          <RadioGroupItem value={branch.id} id={`branch-${branch.id}`} disabled={!canFulfill} className="peer sr-only" />
                          <Label
                            htmlFor={`branch-${branch.id}`}
                            className={`flex w-44 cursor-pointer flex-col gap-1 rounded-lg border-2 p-3 transition-colors hover:bg-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-40 ${isSelected ? "border-accent bg-accent/5" : "border-border"}`}
                          >
                            <span className="truncate text-xs font-semibold text-foreground">{branch.name}</span>
                            <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">{branch.address || branch.code}</span>
                            <div className="mt-auto flex flex-col gap-0.5 pt-1">
                              <span className="flex items-center gap-0.5 text-[11px] font-medium text-accent">
                                <MapPin className="h-2.5 w-2.5" />
                                {formatDistance(branch.distanceKm)}
                              </span>
                              <span className={`text-[11px] font-medium ${canFulfill ? "text-green-600" : "text-destructive"}`}>
                                {canFulfill ? "Đủ hàng" : "Thiếu hàng"}
                              </span>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                )}
              </div>

              <div className="rounded-xl border border-border p-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between"
                  onClick={() => setShippingInfoOpen((o) => !o)}
                >
                  <div className="text-left">
                    <h2 className="text-sm font-semibold text-foreground">Thông tin nhận hàng</h2>
                    {!shippingInfoOpen && shippingInfo.recipientName && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {shippingInfo.recipientName} · {shippingInfo.phone} · {shippingInfo.displayName || shippingInfo.detailAddress}
                      </p>
                    )}
                  </div>
                  {shippingInfoOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {shippingInfoOpen && (
                  <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="recipientName">Người nhận</Label>
                        <Input
                          id="recipientName"
                          value={shippingInfo.recipientName}
                          onChange={(e) =>
                            setShippingInfo((prev) => ({
                              ...prev,
                              recipientName: e.target.value,
                            }))
                          }
                          className="mt-2"
                          placeholder="Họ và tên người nhận"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="shippingPhone">Số điện thoại</Label>
                        <Input
                          id="shippingPhone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="mt-2"
                          placeholder="Số điện thoại liên hệ"
                        />
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground">Địa chỉ từ hồ sơ</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {shippingInfo.displayName || shippingInfo.detailAddress}
                      </p>
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <Link href="/profile/addresses?from=checkout">Đổi địa chỉ trong hồ sơ</Link>
                      </Button>
                    </div>

                    {mapEmbedUrl ? (
                      <div className="mt-3 overflow-hidden rounded-lg border border-border">
                        <iframe
                          title="Bản đồ địa chỉ giao hàng"
                          src={mapEmbedUrl}
                          className="h-48 w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    ) : null}
                  </>
                )}
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
                  <div className="space-y-2">
                    <Label htmlFor="voucherCode">Mã giảm giá</Label>
                    <div className="flex gap-2">
                      <Input
                        id="voucherCode"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã nếu có"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleApplyVoucher()
                          }
                        }}
                        disabled={!selectedBranchId}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={handleApplyVoucher}
                        disabled={!selectedBranchId || isLoadingPreview}
                      >
                        Áp dụng
                      </Button>
                    </div>
                    {voucherError ? (
                      <p className="text-xs text-destructive">{voucherError}</p>
                    ) : preview?.voucher ? (
                      <p className="text-xs text-green-600">Mã {preview.voucher.code} đã được áp dụng</p>
                    ) : !selectedBranchId ? (
                      <p className="text-xs text-muted-foreground">Chọn chi nhánh trước để áp mã giảm giá.</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    {isLoadingPreview ? (
                      <span className="text-muted-foreground">Đang tính...</span>
                    ) : preview ? (
                      preview.shippingFee === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        <span className="font-medium text-foreground">{formatPrice(preview.shippingFee)}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">Chọn chi nhánh để tính</span>
                    )}
                  </div>

                  {preview && preview.distanceKm > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Khoảng cách: {preview.distanceKm} km tới chi nhánh đã chọn
                    </p>
                  ) : null}

                  {preview && preview.discountAmount > 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="font-medium text-green-600">-{formatPrice(preview.discountAmount)}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">
                      {preview ? "Tổng cộng" : "Tạm tính"}
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {preview ? formatPrice(preview.total) : formatPrice(subtotal)}
                    </span>
                  </div>
                  {!preview && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chọn chi nhánh để xem tổng chính xác bao gồm phí giao hàng.
                    </p>
                  )}
                </div>

                {submitError ? (
                  <p className="mt-4 text-sm text-destructive">{submitError}</p>
                ) : null}

                <Button
                  type="submit"
                  className="mt-6 w-full"
                  size="lg"
                  disabled={isLoading || !selectedBranchId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Tiến hành thanh toán"
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
