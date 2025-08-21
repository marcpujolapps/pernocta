import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Star, Shield } from "lucide-react"
import { mockAccommodations } from "@/lib/mock-data"
import Link from "next/link"

export function FeaturedAccommodations() {
  const featuredAccommodations = mockAccommodations.slice(0, 3)

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Allotjaments destacats</h2>
          <p className="text-lg text-muted-foreground">Descobreix els millors allotjaments verificats de Catalunya</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAccommodations.map((accommodation) => (
            <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={accommodation.images[0] || "/placeholder.svg"}
                  alt={accommodation.name}
                  className="w-full h-48 object-cover"
                />
                {accommodation.premium && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">Premium</Badge>
                )}
                <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
                  <Shield className="w-3 h-3 mr-1" />
                  Legal verificat
                </Badge>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-card-foreground">{accommodation.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{accommodation.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{accommodation.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Fins a {accommodation.capacity} persones</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {accommodation.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">€{accommodation.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ nit</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/accommodation/${accommodation.id}`}>Veure detalls</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/results">Veure tots els allotjaments</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
