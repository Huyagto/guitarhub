export interface ApiErrorPayload {
  message?: string
  errors?: Array<{ msg?: string; message?: string }>
}

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

interface ApiSuccessResponse<T> {
  message: string
  metadata: T
}

const DEFAULT_API_URL = "http://127.0.0.1:3000"

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "")
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const headers = new Headers(init.headers)
  const hasJsonBody = init.body && !(init.body instanceof FormData)

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
    })
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Không thể kết nối tới máy chủ",
      0
    )
  }

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await response.json() : undefined

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "API request failed",
      response.status,
      payload
    )
  }

  return payload as ApiSuccessResponse<T>
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return "Không thể kết nối tới backend. Hãy kiểm tra server API đang chạy."
    }

    const validationMessage =
      error.payload?.errors?.[0]?.msg || error.payload?.errors?.[0]?.message
    return validationMessage || error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
