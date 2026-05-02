import { io, type Socket } from "socket.io-client"
import { getAccessToken } from "@/lib/auth"

let socket: Socket | null = null

function getSocketUrl() {
  return (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
}

export function getCustomerSocket() {
  if (typeof window === "undefined") {
    return null
  }

  const token = getAccessToken()

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

export function disconnectCustomerSocket() {
  socket?.disconnect()
  socket = null
}
