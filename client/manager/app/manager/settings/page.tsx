"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell, Building2, Save, Shield, SlidersHorizontal, User } from "lucide-react"
import { Topbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "Quản lý",
    lastName: "GuitarHub",
    email: "manager@guitarhub.vn",
    phone: "0901234567",
    role: "Quản lý hệ thống",
    bio: "Quản lý vận hành GuitarHub.",
  })

  const [system, setSystem] = useState({
    brandName: "GuitarHub",
    contactEmail: "contact@guitarhub.vn",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
  })

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    lowStockAlerts: true,
    customerSignups: true,
    weeklyReports: true,
    securityAlerts: true,
  })

  return (
    <div className="min-h-screen">
      <Topbar title="Cài đặt" description="Quản lý tài khoản và cấu hình chung của hệ thống" />

      <main className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Hệ thống
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Thông báo
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Thông tin hồ sơ</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân và tùy chọn tài khoản</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                    GH
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Đổi ảnh đại diện</Button>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Tên</Label>
                    <Input id="firstName" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Họ</Label>
                    <Input id="lastName" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Điện thoại</Label>
                    <Input id="phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea id="bio" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} rows={3} />
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Thiết lập hệ thống</CardTitle>
                  <CardDescription>
                    Cấu hình chung áp dụng cho toàn bộ hệ thống. Địa chỉ cửa hàng được quản lý riêng theo từng chi nhánh.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="brandName">Tên thương hiệu</Label>
                      <Input
                        id="brandName"
                        value={system.brandName}
                        onChange={(event) => setSystem({ ...system, brandName: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contactEmail">Email liên hệ chung</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={system.contactEmail}
                        onChange={(event) => setSystem({ ...system, contactEmail: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Tiền tệ mặc định</Label>
                      <Select value={system.currency} onValueChange={(value) => setSystem({ ...system, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">VND (₫)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Múi giờ hệ thống</Label>
                      <Select value={system.timezone} onValueChange={(value) => setSystem({ ...system, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Địa chỉ cửa hàng
                  </CardTitle>
                  <CardDescription>
                    Mỗi địa chỉ cửa hàng là một chi nhánh và có kho riêng.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Không cấu hình địa chỉ tại Settings vì GuitarHub có thể có nhiều địa chỉ khác nhau.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/manager/branches">Quản lý chi nhánh</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Tùy chọn thông báo</CardTitle>
                <CardDescription>Chọn những thông báo bạn muốn nhận</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  ["orderAlerts", "Cảnh báo đơn hàng", "Nhận thông báo khi có đơn hàng mới"],
                  ["lowStockAlerts", "Cảnh báo tồn kho thấp", "Nhận thông báo khi sản phẩm sắp hết hàng tại từng chi nhánh"],
                  ["customerSignups", "Khách hàng đăng ký mới", "Thông báo khi có khách hàng mới đăng ký"],
                  ["weeklyReports", "Báo cáo hàng tuần", "Nhận báo cáo tổng hợp hiệu suất hằng tuần"],
                  ["securityAlerts", "Cảnh báo bảo mật", "Những thông báo bảo mật quan trọng"],
                ].map(([key, title, description]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                      />
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu tùy chọn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu để giữ an toàn cho tài khoản</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <div className="flex justify-end">
                    <Button>Cập nhật mật khẩu</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Xác thực hai lớp</CardTitle>
                  <CardDescription>Thêm một lớp bảo mật bổ sung cho tài khoản</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bật 2FA</p>
                      <p className="text-sm text-muted-foreground">Bảo vệ tài khoản bằng xác thực hai lớp</p>
                    </div>
                    <Button variant="outline">Bật</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
