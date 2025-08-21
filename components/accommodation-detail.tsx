"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Shield,
  ExternalLink,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageCircle,
  Award,
} from "lucide-react"
import Link from "next/link"

interface Accommodation {
  id: number
  name: string
  location: string
  fullAddress: string
  coordinates: [number, number]
  capacity: number
  bedrooms: number
  bathrooms: number
  rating: number
  reviews: number
  price: number
  originalPrice: number
  images: string[]
  type: string
  verified: boolean
  premium: boolean
  registrationCode: string
  description: string
  longDescription: string
  amenities: Array<{
    name: string
    icon: string
    category: string
  }>
  platforms: Array<{
    name: string
    url: string
    price: number
    available: boolean
  }>
  rules: string[]
  nearbyAttractions: Array<{
    name: string
    distance: string
  }>
  host: {
    name: string
    avatar: string
    joinedYear: number
    reviews: number
    responseRate: number
    languages: string[]
  }
}

interface AccommodationDetailProps {
  accommodation: Accommodation
}

export function AccommodationDetail({ accommodation }: AccommodationDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % accommodation.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + accommodation.images.length) % accommodation.images.length)
  }

  const groupedAmenities = accommodation.amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = []
      }
      acc[amenity.category].push(amenity)
      return acc
    },
    {} as Record<string, typeof accommodation.amenities>,
  )

  const bestPrice = Math.min(...accommodation.platforms.filter((p) => p.available).map((p) => p.price))
  const bestPlatform = accommodation.platforms.find((p) => p.price === bestPrice && p.available)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/results">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tornar als resultats
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              Guardar
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and basic info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{accommodation.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{accommodation.rating}</span>
                  <span>({accommodation.reviews} valoracions)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{accommodation.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  <Shield className="w-3 h-3 mr-1" />
                  Legal verificat
                </Badge>
                {accommodation.premium && <Badge className="bg-accent text-accent-foreground">Premium</Badge>}
                <Badge variant="outline">{accommodation.type}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden group">
            <img
              src={accommodation.images[currentImageIndex] || "/placeholder.svg"}
              alt={accommodation.name}
              className="w-full h-full object-cover"
            />

            {accommodation.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {accommodation.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {accommodation.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {accommodation.images.slice(1, 5).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index + 1)}
                  className="relative h-20 rounded overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${accommodation.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-6 mb-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{accommodation.capacity} persones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  <span>{accommodation.bedrooms} habitacions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5" />
                  <span>{accommodation.bathrooms} banys</span>
                </div>
              </div>

              <p className="text-foreground leading-relaxed mb-4">{accommodation.description}</p>

              <p className="text-muted-foreground leading-relaxed">{accommodation.longDescription}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Serveis i equipaments</h2>

              <div className="space-y-6">
                {Object.entries(groupedAmenities).map(([category, amenities]) => (
                  <div key={category}>
                    <h3 className="font-medium text-foreground mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {amenities.slice(0, showAllAmenities ? amenities.length : 4).map((amenity) => (
                        <div key={amenity.name} className="flex items-center gap-3">
                          <span className="text-lg">{amenity.icon}</span>
                          <span className="text-muted-foreground">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {accommodation.amenities.length > 8 && (
                <Button variant="outline" onClick={() => setShowAllAmenities(!showAllAmenities)} className="mt-4">
                  {showAllAmenities ? "Mostrar menys" : `Mostrar tots els ${accommodation.amenities.length} serveis`}
                </Button>
              )}
            </div>

            <Separator />

            {/* Location */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Ubicació</h2>

              <div className="mb-4">
                <p className="text-muted-foreground mb-2">{accommodation.fullAddress}</p>

                <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p>Mapa interactiu</p>
                    <p className="text-sm">Coordenades: {accommodation.coordinates.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3">Llocs d&apos;interès propers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accommodation.nearbyAttractions.map((attraction) => (
                    <div key={attraction.name} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{attraction.name}</span>
                      <span className="text-sm font-medium">{attraction.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Rules */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Normes de la casa</h2>

              <div className="space-y-3">
                {accommodation.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Host Info */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Amfitrió</h2>

              <div className="flex items-start gap-4">
                <img
                  src={accommodation.host.avatar || "/placeholder.svg"}
                  alt={accommodation.host.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{accommodation.host.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Amfitrió des de {accommodation.host.joinedYear}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{accommodation.host.reviews}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Valoracions</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="font-medium">{accommodation.host.responseRate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Taxa de resposta</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-medium">Superamfitrió</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reconeixement</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Idiomes:</p>
                    <div className="flex gap-2">
                      {accommodation.host.languages.map((language) => (
                        <Badge key={language} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-baseline gap-2 mb-2">
                    {accommodation.originalPrice > accommodation.price && (
                      <span className="text-lg text-muted-foreground line-through">€{accommodation.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-primary">€{accommodation.price}</span>
                    <span className="text-muted-foreground">/ nit</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{accommodation.rating}</span>
                    <span className="text-muted-foreground">({accommodation.reviews} valoracions)</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-3">
                      <label className="text-xs text-muted-foreground">ENTRADA</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Seleccionar</span>
                      </div>
                    </div>
                    <div className="border rounded p-3">
                      <label className="text-xs text-muted-foreground">SORTIDA</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Seleccionar</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded p-3">
                    <label className="text-xs text-muted-foreground">PERSONES</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">2 persones</span>
                    </div>
                  </div>

                  {bestPlatform && (
                    <Button size="lg" className="w-full h-12 text-lg font-semibold" asChild>
                      <a href={bestPlatform.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Consultar disponibilitat i reservar
                      </a>
                    </Button>
                  )}

                  <p className="text-xs text-center text-muted-foreground">No es farà cap càrrec encara</p>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-foreground mb-3">Disponible a aquestes plataformes:</h3>
                    <div className="space-y-2">
                      {accommodation.platforms.map((platform) => (
                        <div
                          key={platform.name}
                          className={`flex items-center justify-between p-3 rounded border ${
                            platform.available ? "bg-background" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">{platform.name}</span>
                            {!platform.available && (
                              <Badge variant="outline" className="text-xs">
                                No disponible
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                platform.available ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              €{platform.price}
                            </span>
                            {platform.available && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span className="font-medium text-sm">Allotjament legal verificat</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Codi de registre: {accommodation.registrationCode}</p>
                    <p className="text-xs text-muted-foreground mt-1">Verificat per la Generalitat de Catalunya</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
