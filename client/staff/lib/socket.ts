import { io, type Socket } from "socket.io-client"
import { getStaffAccessToken } from "@/lib/auth"

let socket: Socket | null = null

function getSocketUrl() {
  return (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
}

export function getStaffSocket() {
  if (typeof window === "undefined") {
    return null
  }

  const token = getStaffAccessToken()

  if (!token) {
    return null
  }

  if (socket) {
    return socket
  }

  socket = io(getSocketUrl(), {
    transports: ["websocket"],
    auth: {
      token,
    },
  })

  return socket
}

export function disconnectStaffSocket() {
  socket?.disconnect()
  socket = null
}
