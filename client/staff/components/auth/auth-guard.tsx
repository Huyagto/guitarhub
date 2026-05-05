"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getStaffAccessToken } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasAccessToken, setHasAccessToken] = useState<boolean | null>(null)

  useEffect(() => {
    const accessToken = getStaffAccessToken()

    if (!accessToken) {
      setHasAccessToken(false)
      router.replace("/login")
      return
    }

    setHasAccessToken(true)
  }, [router])

  if (hasAccessToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasAccessToken) {
    return null
  }

  return <>{children}</>
}
