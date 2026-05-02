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
import { createCheckout, getAvailableCheckoutBranches, type AvailableBranch } from "@/lib/checkout-api"

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

  const freeShippingThreshold = 5000000
  const defaultShippingFee = 30000
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : defaultShippingFee
  const total = subtotal + shippingFee
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
      try {
        const availableBranches = await getAvailableCheckoutBranches(items.map((item) => item.product.id))
        setBranches(availableBranches)
        setSelectedBranchId((current) => current || availableBranches[0]?.id || "")
      } catch {
        setBranches([])
      } finally {
        setIsLoadingBranches(false)
      }
    }

    if (items.length) {
      void loadBranches()
    }
  }, [items])

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

      const checkout = await createCheckout({
        paymentMethod,
        branchId: selectedBranchId,
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
                  Chi nhánh xử lý đơn
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chọn chi nhánh còn đủ các mặt hàng trong giỏ. Đơn online sẽ trừ tồn kho tại chi nhánh này.
                </p>

                {isLoadingBranches ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang kiểm tra tồn kho chi nhánh...
                  </div>
                ) : branches.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Hiện chưa có chi nhánh nào đủ hàng cho toàn bộ giỏ hàng.
                  </p>
                ) : (
                  <RadioGroup value={selectedBranchId} onValueChange={setSelectedBranchId} className="mt-5 grid gap-3">
                    {branches.map((branch) => {
                      const canFulfill = branchCanFulfillCart(branch)

                      return (
                        <div key={branch.id}>
                          <RadioGroupItem value={branch.id} id={`branch-${branch.id}`} disabled={!canFulfill} className="peer sr-only" />
                          <Label
                            htmlFor={`branch-${branch.id}`}
                            className="flex cursor-pointer flex-col gap-2 rounded-lg border-2 border-border p-4 transition-colors hover:bg-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                          >
                            <span className="font-medium text-foreground">{branch.name}</span>
                            <span className="text-sm text-muted-foreground">{branch.address || branch.code}</span>
                            <span className="text-xs text-muted-foreground">
                              {canFulfill ? "Đủ hàng cho giỏ hiện tại" : "Không đủ số lượng trong giỏ"}
                            </span>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                )}
              </div>

              <div className="rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Thông tin nhận hàng
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Điền người nhận và số điện thoại tại đây. Địa chỉ được lấy từ hồ sơ của bạn.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Địa chỉ từ hồ sơ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shippingInfo.displayName || shippingInfo.detailAddress}
                  </p>

                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/profile/addresses?from=checkout">Đổi địa chỉ trong hồ sơ</Link>
                  </Button>
                </div>

                {mapEmbedUrl ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-border">
                    <iframe
                      title="Bản đồ địa chỉ giao hàng"
                      src={mapEmbedUrl}
                      className="h-72 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : null}
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
