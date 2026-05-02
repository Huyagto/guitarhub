import { StaffWorkspaceShell } from "@/components/layout/staff-workspace-shell"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StaffWorkspaceShell>{children}</StaffWorkspaceShell>
}
