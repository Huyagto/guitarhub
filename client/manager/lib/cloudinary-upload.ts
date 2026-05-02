import { apiRequest } from "@/lib/api"
import { getManagerAccessToken } from "@/lib/auth"

export async function uploadManagerProductImage(file: string) {
  const token = getManagerAccessToken()

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản lý để tải ảnh")
  }

  const response = await apiRequest<{
    url: string
    publicId: string
  }>("/api/manager/uploads/image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ file }),
  })

  return response.metadata
}
