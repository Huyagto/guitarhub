export interface OsmAddress {
  road?: string
  house_number?: string
  suburb?: string
  quarter?: string
  neighbourhood?: string
  village?: string
  town?: string
  city?: string
  county?: string
  state?: string
  country?: string
}

export interface OsmSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: OsmAddress
}

function getOsmBaseUrl() {
  return "https://nominatim.openstreetmap.org"
}

export async function searchOsmAddress(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "vn",
  })

  const response = await fetch(`${getOsmBaseUrl()}/search?${params.toString()}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Không thể tìm địa chỉ từ OpenStreetMap")
  }

  return (await response.json()) as OsmSearchResult[]
}

export function mapOsmResultToShippingAddress(result: OsmSearchResult) {
  const address = result.address || {}
  const streetParts = [
    address.house_number,
    address.road,
  ].filter(Boolean)

  return {
    province: address.state || address.city || "",
    district: address.county || address.town || address.city || "",
    ward:
      address.suburb ||
      address.quarter ||
      address.neighbourhood ||
      address.village ||
      "",
    detailAddress: streetParts.join(" ") || result.display_name.split(",")[0] || "",
  }
}
