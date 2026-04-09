"use client"

import Link from "next/link"
import Image from "next/image"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { EmptyState } from "@/components/ui/empty-state"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/mock-data"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  
  const shippingFee = subtotal >= 500 ? 0 : 25
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <BreadcrumbNav items={[{ label: "Giỏ hàng" }]} />
          <div className="mt-16">
            <EmptyState
              icon={ShoppingBag}
              title="Giỏ hàng của bạn đang trống"
              description="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy bắt đầu mua sắm để tìm cây đàn phù hợp nhé."
              action={
                <Button asChild>
                  <Link href="/shop">
                    Tiếp tục mua sắm
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav items={[{ label: "Giỏ hàng" }]} />

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
          Giỏ hàng
        </h1>
        <p className="mt-2 text-muted-foreground">
          Có {items.length} {items.length === 1 ? "sản phẩm" : "sản phẩm"} trong giỏ hàng
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-border rounded-xl border border-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 sm:p-6">
                  {/* Product image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </Link>

                  {/* Product details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-medium text-foreground hover:text-accent transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.product.brand}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa sản phẩm</span>
                      </Button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.product.price)} / sản phẩm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href="/shop">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tạm tính ({items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)
                  </span>
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
                {subtotal < 500 && (
                  <p className="text-xs text-muted-foreground">
                    Mua thêm {formatPrice(500 - subtotal)} để được miễn phí giao hàng
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <Input placeholder="Nhập mã giảm giá" className="flex-1" />
                  <Button variant="outline">Áp dụng</Button>
                </div>
              </div>

              <Button asChild className="mt-6 w-full" size="lg">
                <Link href="/checkout">
                  Tiến hành thanh toán
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Thanh toán an toàn với mã hóa SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
