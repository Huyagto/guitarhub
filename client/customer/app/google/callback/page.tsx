"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveAuthSession, type AuthUser } from "@/lib/auth"

function decodeBase64UrlUtf8(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
  const binary = window.atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function parseGoogleCallbackHash() {
  if (typeof window === "undefined") {
    return null
  }

  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash

  const params = new URLSearchParams(rawHash)
  const accessToken = params.get("accessToken")
  const refreshToken = params.get("refreshToken")
  const userEncoded = params.get("user")
  const error = params.get("error")

  if (error) {
    return { error }
  }

  if (!accessToken || !refreshToken || !userEncoded) {
    return { error: "Thiếu dữ liệu đăng nhập từ Google." }
  }

  try {
    const user = JSON.parse(decodeBase64UrlUtf8(userEncoded)) as AuthUser
    return { accessToken, refreshToken, user }
  } catch {
    return { error: "Không thể đọc dữ liệu tài khoản Google." }
  }
}

export default function GoogleCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    const result = parseGoogleCallbackHash()

    if (!result) {
      setError("Không thể xử lý đăng nhập Google.")
      return
    }

    if ("error" in result) {
      setError(result.error)
      return
    }

    saveAuthSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })

    window.history.replaceState(null, "", "/google/callback")
    router.replace("/profile")
  }, [router])

  if (!error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Đang đăng nhập với Google
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hệ thống đang hoàn tất phiên đăng nhập và chuyển bạn về trang tài khoản.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Đăng nhập Google chưa hoàn tất
          </h2>
          <p className="mt-2 text-sm text-destructive">{error}</p>
        </div>

        <Button asChild>
          <Link href="/login">Quay lại đăng nhập</Link>
        </Button>
      </div>
    </div>
  )
}
