"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Home, Hotel, Tent, Trees, Building } from "lucide-react"
import MapGL, { Marker, NavigationControl, GeolocateControl, MapRef } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Place } from "@/lib/place"

interface MapViewProps {
  accommodations: Place[]
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
  const mapRef = useRef<MapRef | null>(null)

  // Get appropriate icon based on accommodation type
  const getAccommodationIcon = (type: string | null) => {
    if (!type) return MapPin
    
    const normalizedType = type.toLowerCase()
    
    if (normalizedType.includes('hotel')) return Hotel
    if (normalizedType.includes('casa rural') || normalizedType.includes('rural')) return Trees
    if (normalizedType.includes('apartament') || normalizedType.includes('apartment')) return Building
    if (normalizedType.includes('camping') || normalizedType.includes('camp')) return Tent
    if (normalizedType.includes('casa') || normalizedType.includes('home')) return Home
    
    // Default fallback
    return MapPin
  }

  // Calculate bounds based on accommodations
  useEffect(() => {
    if (accommodations.length > 0) {
      const accommodationsWithCoords = accommodations.filter(
        (a) => a.coordinates !== undefined
      )
      
      if (accommodationsWithCoords.length > 0 && mapRef.current) {
        const lats = accommodationsWithCoords.map(a => a.coordinates![1])
        const lngs = accommodationsWithCoords.map(a => a.coordinates![0])

        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLng = Math.min(...lngs)
        const maxLng = Math.max(...lngs)

        // Use Mapbox's fitBounds to automatically fit all markers
        mapRef.current.getMap().fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          {
            padding: 50, // Add padding around the bounds
            duration: 1000 // Animation duration
          }
        )
      } else {
        // No accommodations have coordinates, use default location
        setViewState(prev => ({
          ...prev,
          latitude: 41.99,
          longitude: 1.6,
        }))
      }
    } else {
      // No accommodations at all, use default location
      setViewState(prev => ({
        ...prev,
        latitude: 41.99,
        longitude: 1.6,
      }))
    }
  }, [accommodations])

  return (
    <div className="relative w-full h-full">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Accommodation markers */}
        {accommodations.filter(
          (accommodation) => accommodation.coordinates !== undefined
        ).map((accommodation) => {
          const accommodationId = accommodation.licence_id || accommodation.slug || "unknown"
          const isSelected = selectedAccommodation === accommodationId
          const isHovered = hoveredAccommodation === accommodationId
          const IconComponent = getAccommodationIcon(accommodation.type)

          return (
            <Marker
              key={accommodationId}
              longitude={accommodation.coordinates![0]}
              latitude={accommodation.coordinates![1]}
              anchor="center"
              style={{ zIndex: isSelected ? 1000 : isHovered ? 500 : 1 }}
            >
              <div
                className="cursor-pointer"
                onClick={() => onAccommodationSelect(accommodationId)}
                onMouseEnter={() => onAccommodationHover(accommodationId)}
                onMouseLeave={() => onAccommodationHover(null)}
              >
                <div
                  className={`relative transition-all duration-200 ${
                    isSelected || isHovered ? "scale-110" : ""
                  }`}
                  style={{ zIndex: isSelected ? 1000 : isHovered ? 500 : 1 }}
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
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {isSelected && (
                    <Card 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 shadow-xl"
                      style={{ zIndex: isSelected ? 1001 : 501 }}
                    >
                      <CardContent className="p-2">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs line-clamp-1">{accommodation.name || "Sense nom"}</h4>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {accommodation.municipality || "Ubicació no especificada"}
                            </span>
                          </div>
                          {accommodation.total_places && accommodation.total_places > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {accommodation.total_places} places
                            </div>
                          )}
                          {accommodation.type && accommodation.type !== "—" && (
                            <div className="text-xs bg-gray-100 px-1 py-0.5 rounded text-center">
                              {accommodation.type}
                            </div>
                          )}
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
            <Hotel className="w-4 h-4 text-muted-foreground" />
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <Trees className="w-4 h-4 text-muted-foreground" />
            <span>Casa Rural</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span>Apartament</span>
          </div>
          <div className="flex items-center gap-2">
            <Tent className="w-4 h-4 text-muted-foreground" />
            <span>Camping</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span>Casa</span>
          </div>
          <hr className="my-2" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span>Seleccionat</span>
          </div>
        </div>
      </div>
    </div>
  )
}