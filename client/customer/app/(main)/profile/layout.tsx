import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <BreadcrumbNav items={[{ label: "Tài khoản của tôi" }]} />

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground">
          Tài khoản của tôi
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <ProfileSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
