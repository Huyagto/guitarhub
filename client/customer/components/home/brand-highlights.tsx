import { Shield, Truck, RefreshCw, HeadphonesIcon } from "lucide-react"

const highlights = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $500",
  },
  {
    icon: Shield,
    title: "Authenticity Guaranteed",
    description: "100% genuine products",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    description: "Guitar specialists available",
  },
]

export function BrandHighlights() {
  return (
    <section className="border-y border-border bg-muted/50 py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
