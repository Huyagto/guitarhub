import { Suspense } from "react"
import { CheckoutSuccessContent } from "./success-content"

interface CheckoutSuccessPageProps {
  searchParams?: Promise<{
    orderCode?: string
    paymentMethod?: string
    status?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = (await searchParams) || {}

  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent
        orderCode={params.orderCode || ""}
        paymentMethod={params.paymentMethod || "cod"}
        status={params.status || "success"}
      />
    </Suspense>
  )
}
