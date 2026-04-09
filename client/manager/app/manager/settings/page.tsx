"use client"

import { useState } from "react"
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
import { User, Store, Bell, Shield, Save } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@guitarstore.com",
    phone: "+1 (555) 123-4567",
      role: "Quản lý cửa hàng",
      bio: "Quản lý cửa hàng guitar với hơn 10 năm kinh nghiệm trong ngành bán lẻ nhạc cụ.",
  })

  const [store, setStore] = useState({
    name: "Guitar Store",
    email: "contact@guitarstore.com",
    phone: "+1 (555) 987-6543",
    address: "123 Music Avenue, Nashville, TN 37203",
    currency: "USD",
    timezone: "America/New_York",
  })

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    lowStockAlerts: true,
    customerSignups: true,
    marketingEmails: false,
    weeklyReports: true,
    securityAlerts: true,
  })

  return (
    <div className="min-h-screen">
      <Topbar title="Cài đặt" description="Quản lý tài khoản và thiết lập cửa hàng" />

      <main className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Cửa hàng
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

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Thông tin hồ sơ</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân và tùy chọn của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Đổi ảnh đại diện
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, GIF hoặc PNG. Tối đa 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Tên</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Họ</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Điện thoại</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                  />
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

          {/* Store Settings */}
          <TabsContent value="store">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Thiết lập cửa hàng</CardTitle>
                <CardDescription>
                  Cấu hình thông tin và tùy chọn của cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="storeName">Tên cửa hàng</Label>
                    <Input
                      id="storeName"
                      value={store.name}
                      onChange={(e) => setStore({ ...store, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="storeEmail">Email cửa hàng</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={store.email}
                      onChange={(e) => setStore({ ...store, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="storePhone">Số điện thoại cửa hàng</Label>
                    <Input
                      id="storePhone"
                      value={store.phone}
                      onChange={(e) => setStore({ ...store, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={store.address}
                      onChange={(e) => setStore({ ...store, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Tiền tệ</Label>
                    <Select
                      value={store.currency}
                      onValueChange={(value) => setStore({ ...store, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Múi giờ</Label>
                    <Select
                      value={store.timezone}
                      onValueChange={(value) => setStore({ ...store, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Giờ miền Đông</SelectItem>
                        <SelectItem value="America/Chicago">Giờ miền Trung</SelectItem>
                        <SelectItem value="America/Denver">Giờ miền Núi</SelectItem>
                        <SelectItem value="America/Los_Angeles">Giờ Thái Bình Dương</SelectItem>
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
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Tùy chọn thông báo</CardTitle>
                <CardDescription>
                  Chọn những thông báo bạn muốn nhận
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cảnh báo đơn hàng</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có đơn hàng mới
                      </p>
                    </div>
                    <Switch
                      checked={notifications.orderAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, orderAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cảnh báo tồn kho thấp</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi sản phẩm sắp hết hàng
                      </p>
                    </div>
                    <Switch
                      checked={notifications.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, lowStockAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Khách hàng đăng ký mới</p>
                      <p className="text-sm text-muted-foreground">
                        Thông báo khi có khách hàng mới đăng ký
                      </p>
                    </div>
                    <Switch
                      checked={notifications.customerSignups}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, customerSignups: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Báo cáo hàng tuần</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận báo cáo tổng hợp hiệu suất hằng tuần
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cảnh báo bảo mật</p>
                      <p className="text-sm text-muted-foreground">
                        Những thông báo bảo mật quan trọng
                      </p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, securityAlerts: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu tùy chọn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Cập nhật mật khẩu để giữ an toàn cho tài khoản
                  </CardDescription>
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
                  <CardDescription>
                    Thêm một lớp bảo mật bổ sung cho tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bật 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Bảo vệ tài khoản bằng xác thực hai lớp
                      </p>
                    </div>
                    <Button variant="outline">Bật</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
                  <CardDescription>
                    Các hành động không thể hoàn tác
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Xóa tài khoản</p>
                      <p className="text-sm text-muted-foreground">
                        Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn
                      </p>
                    </div>
                    <Button variant="destructive">Xóa tài khoản</Button>
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
