"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import MapGL, { Marker, NavigationControl, GeolocateControl } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { PlaceWithCoordinates } from "@/lib/place"

interface MapViewProps {
  accommodations: PlaceWithCoordinates[]
  selectedAccommodation: string | null
  hoveredAccommodation: string | null
  onAccommodationSelect: (id: string) => void
  onAccommodationHover: (id: string | null) => void
}

export function MapView({
  accommodations,
  selectedAccommodation,
  hoveredAccommodation,
  onAccommodationSelect,
  onAccommodationHover,
}: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude: 41.6,
    longitude: 1.5,
    zoom: 8
  })

  // Calculate bounds based on accommodations
  useEffect(() => {
    if (accommodations.length > 0) {
      const lats = accommodations.map(a => a.coordinates[1])
      const lngs = accommodations.map(a => a.coordinates[0])
      
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2
      
      setViewState(prev => ({
        ...prev,
        latitude: centerLat,
        longitude: centerLng,
      }))
    }
  }, [accommodations])

  return (
    <div className="relative w-full h-full">
      <MapGL
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Accommodation markers */}
        {accommodations.map((accommodation) => {
          const accommodationId = accommodation.licence_id || accommodation.slug || "unknown"
          const isSelected = selectedAccommodation === accommodationId
          const isHovered = hoveredAccommodation === accommodationId

          return (
            <Marker
              key={accommodationId}
              longitude={accommodation.coordinates[0]}
              latitude={accommodation.coordinates[1]}
              anchor="center"
            >
              <div
                className="cursor-pointer"
                onClick={() => onAccommodationSelect(accommodationId)}
                onMouseEnter={() => onAccommodationHover(accommodationId)}
                onMouseLeave={() => onAccommodationHover(null)}
              >
                <div
                  className={`relative transition-all duration-200 ${
                    isSelected || isHovered ? "scale-110 z-20" : "z-10"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground scale-110"
                        : isHovered
                          ? "bg-accent text-accent-foreground"
                          : "bg-background text-foreground border border-border"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>

                  {(isSelected || isHovered) && (
                    <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 shadow-xl z-30">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm line-clamp-2">{accommodation.name || "Sense nom"}</h4>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {[accommodation.municipality, accommodation.province].filter(Boolean).join(", ") || "Ubicació no especificada"}
                            </span>
                          </div>
                          {accommodation.total_places && accommodation.total_places > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Capacitat: {accommodation.total_places} places
                            </div>
                          )}
                          {accommodation.type && accommodation.type !== "—" && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {accommodation.type}
                            </div>
                          )}
                          {accommodation.licence_id && accommodation.licence_id !== "—" && (
                            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              Llicència: {accommodation.licence_id}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </Marker>
          )
        })}
      </MapGL>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-background rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Llegenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded-full"></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-background border border-border rounded-full"></div>
            <span>Estàndard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span>Seleccionat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <span>Seleccionat</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
