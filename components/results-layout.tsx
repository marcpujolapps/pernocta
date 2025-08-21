"use client"

import { fetchCollectionPage, Filter } from "@/lib/firestore"
import { useEffect, useState, use } from "react"
import { AccommodationCard } from "@/components/accommodation-card"
import { MapView } from "@/components/map-view"
import { Button } from "@/components/ui/button"
import { Map, List } from "lucide-react"
import type { Place, PlaceWithCoordinates } from "@/lib/place"

// Represent a place with its Firestore document ID
type AccommodationItem = PlaceWithCoordinates & { id: string }

export function ResultsLayout({
  searchParamsPromise,
  onResultsCount,
}: {
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>
  onResultsCount?: (count: number) => void
}) {
  const searchParams = use(searchParamsPromise)
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split")
  const [selectedAccommodation, setSelectedAccommodation] = useState<
    string | null
  >(null)
  const [hoveredAccommodation, setHoveredAccommodation] = useState<
    string | null
  >(null)

  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)

    // Load initial results
  useEffect(() => {
    let cancelled = false
    
    // Function to build filters from search params
    const buildFilters = () => {
      const filters: Filter[] = []
  const { municipality_code, county_code, location, types, guests } = searchParams

      if (municipality_code && typeof municipality_code === "string") {
        filters.push({
          field: "municipality_code",
          op: "==",
          value: Number(municipality_code),
        })
      } else if (county_code && typeof county_code === "string") {
        filters.push({
          field: "county_code",
          op: "==",
          value: Number(county_code),
        })
      } else if (location && typeof location === "string") {
        // Fallback for zones or free text.
        // This might need a more complex search (e.g. Algolia) for robust free-text matching.
        // For now, we can filter by tourist brand for zones like "Costa Brava".
        filters.push({ field: "tourist_brand", op: "==", value: location })
      }

      if (types && typeof types === "string") {
        const typeList = types.split(",").filter(type => type !== "tots") // Filter out "tots" since it means all types
        if (typeList.length > 0) {
          filters.push({ field: "type", op: "in", value: typeList })
        }
      }

      // Add capacity filter based on total number of guests
  const totalGuests = guests ? Number(guests) : 2
      if (totalGuests > 0) {
        filters.push({
          field: "total_places",
          op: ">=",
          value: totalGuests,
        })
      }

      return filters
    }
    
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const filters = buildFilters()

        const page = await fetchCollectionPage<Place>("places", {
          filters,
          limit: 20,
          order: [{ field: "name", direction: "asc" }], // Add ordering for consistent pagination
        })
        if (cancelled) return

        const adapted = adaptPlaceData(page.items)
        setAccommodations(adapted)
        setNextCursor(page.nextCursor)
        setHasMore(!!page.nextCursor)
        
        // Notify parent about results count
        if (onResultsCount) {
          onResultsCount(adapted.length)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) setError(msg || "Error carregant dades")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [searchParams, onResultsCount])

  // Function to adapt place data for display
  const adaptPlaceData = (places: (Place & { id: string })[], startIndex: number = 0): AccommodationItem[] => {
    return places.map((p, idx) => {
      // Add coordinates for map display (using pseudo coordinates until real geo available)
      const baseLat = 41.3
      const baseLng = 2.1
      const jitter = (i: number, scale: number) =>
        ((i * 37) % 100) / (100 * scale)
      const lat = baseLat + jitter(startIndex + idx, 10)
      const lng = baseLng + jitter(startIndex + idx + 13, 10)

      return {
        ...p,
        // Add required coordinates field
        coordinates: p.coordinates || ([lng, lat] as [number, number]),
      }
    })
  }

  // Load more results function
  const loadMoreResults = async () => {
    if (!nextCursor || loadingMore) return

    try {
      setLoadingMore(true)
      setError(null)

      // Function to build filters from search params
      const buildFilters = () => {
        const filters: Filter[] = []
  const { municipality_code, county_code, location, types, guests } = searchParams

        if (municipality_code && typeof municipality_code === "string") {
          filters.push({
            field: "municipality_code",
            op: "==",
            value: Number(municipality_code),
          })
        } else if (county_code && typeof county_code === "string") {
          filters.push({
            field: "county_code",
            op: "==",
            value: Number(county_code),
          })
        } else if (location && typeof location === "string") {
          // Fallback for zones or free text.
          // This might need a more complex search (e.g. Algolia) for robust free-text matching.
          // For now, we can filter by tourist brand for zones like "Costa Brava".
          filters.push({ field: "tourist_brand", op: "==", value: location })
        }

        if (types && typeof types === "string") {
          const typeList = types.split(",").filter(type => type !== "tots") // Filter out "tots" since it means all types
          if (typeList.length > 0) {
            filters.push({ field: "type", op: "in", value: typeList })
          }
        }

        // Add capacity filter based on total number of guests
  const totalGuests = guests ? Number(guests) : 2
        if (totalGuests > 0) {
          filters.push({
            field: "total_places",
            op: ">=",
            value: totalGuests,
          })
        }

        return filters
      }

      const filters = buildFilters()

      const page = await fetchCollectionPage<Place>("places", {
        filters,
        limit: 20,
        order: [{ field: "name", direction: "asc" }],
        cursor: nextCursor,
      })

      const adapted = adaptPlaceData(page.items, accommodations.length)
      setAccommodations(prev => [...prev, ...adapted])
      setNextCursor(page.nextCursor)
      setHasMore(!!page.nextCursor)
      
      // Notify parent about updated results count
      if (onResultsCount) {
        onResultsCount(accommodations.length + adapted.length)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || "Error carregant més resultats")
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Mobile view toggle */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex bg-background border rounded-full p-1 shadow-lg">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-full"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="rounded-full"
          >
            <Map className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div
        className={`${
          viewMode === "map"
            ? "hidden md:block md:w-1/2"
            : viewMode === "list"
            ? "w-full"
            : "w-full md:w-1/2"
        } overflow-y-auto bg-gray-50/50`}
      >
        <div className="p-4">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Carregant resultats...
            </div>
          )}
          {error && <div className="text-center py-8 text-red-500">{error}</div>}
          {!loading && !error && accommodations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Cap resultat
            </div>
          )}
          
          {/* Grid layout for cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
            {accommodations.map(accommodation => {
              const accommodationId = accommodation.id
              return (
                <AccommodationCard
                  key={accommodationId}
                  accommodation={accommodation}
                  isSelected={selectedAccommodation === accommodationId}
                  isHovered={hoveredAccommodation === accommodationId}
                  onSelect={() => setSelectedAccommodation(accommodationId)}
                  onHover={() => setHoveredAccommodation(accommodationId)}
                  onLeave={() => setHoveredAccommodation(null)}
                />
              )
            })}
          </div>

          {accommodations.length > 0 && hasMore && (
            <div className="text-center py-8">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white hover:bg-gray-50 shadow-sm"
                onClick={loadMoreResults}
                disabled={loadingMore}
              >
                {loadingMore ? "Carregant..." : "Carregar més resultats"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div
        className={`${
          viewMode === "list"
            ? "hidden md:block md:w-1/2"
            : viewMode === "map"
            ? "w-full"
            : "hidden md:block md:w-1/2"
        } relative`}
      >
        <MapView
          accommodations={accommodations}
          selectedAccommodation={selectedAccommodation}
          hoveredAccommodation={hoveredAccommodation}
          onAccommodationSelect={setSelectedAccommodation}
          onAccommodationHover={setHoveredAccommodation}
        />
      </div>
    </div>
  )
}
