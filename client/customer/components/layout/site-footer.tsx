import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const footerLinks = {
  shop: [
    { name: "Guitar Acoustic", href: "/shop?category=acoustic-guitar" },
    { name: "Guitar Electric", href: "/shop?category=electric-guitar" },
    { name: "Guitar Bass", href: "/shop?category=bass-guitar" },
    { name: "Guitar Classic", href: "/shop?category=classical-guitar" },
    { name: "Phụ kiện", href: "/shop?category=accessories" },
  ],
  support: [
    { name: "Liên hệ", href: "/contact" },
    { name: "Câu hỏi thường gặp", href: "/faq" },
    { name: "Thông tin giao hàng", href: "/shipping" },
    { name: "Đổi trả", href: "/returns" },
    { name: "Theo dõi đơn hàng", href: "/track-order" },
  ],
  company: [
    { name: "Về chúng tôi", href: "/about" },
    { name: "Tuyển dụng", href: "/careers" },
    { name: "Báo chí", href: "/press" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Điều khoản dịch vụ", href: "/terms" },
    { name: "Chính sách cookie", href: "/cookies" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Newsletter section */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Đăng ký nhận bản tin
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhận cập nhật mới nhất về sản phẩm mới và chương trình ưu đãi sắp diễn ra.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1"
                required
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Guitar<span className="text-accent">Hub</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Điểm đến dành cho guitar và phụ kiện cao cấp. Nhạc cụ chất lượng cho mọi người chơi, từ người mới bắt đầu đến chuyên nghiệp.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cửa hàng</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Hỗ trợ</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Công ty</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Liên hệ</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Hệ thống cửa hàng GuitarHub<br />TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="tel:+1-555-123-4567"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  +1 (555) 123-4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@guitarhub.vn"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  support@guitarhub.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GuitarHub. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
