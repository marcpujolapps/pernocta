"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, ArrowLeft, SlidersHorizontal, Plus, Minus, Star, Euro, Wifi, Car, Coffee } from "lucide-react"
import Link from "next/link"
import { ACCOMMODATION_TYPES } from "@/lib/accommodation-types"

interface LocationSuggestion {
  name: string;
  type: 'Municipi' | 'Comarca' | 'Zona';
  region: string;
  code?: number;
  county_code?: number;
}

interface RawMunicipality {
  Codi: number;
  Nom: string;
  'Codi comarca': number;
  'Nom comarca': string;
}

export function ResultsHeader({ 
  searchParamsPromise,
  resultsCount = 0 
}: { 
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>
  resultsCount?: number
}) {
  const searchParams = use(searchParamsPromise)
  const [showFilters, setShowFilters] = useState(false)
  const [locationName, setLocationName] = useState<string>("")
  const [guests, setGuests] = useState(2)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // Load municipality data and resolve location name
  useEffect(() => {
    fetch('/municipis.json')
      .then(res => res.json())
      .then((data: RawMunicipality[]) => {
        const municipalities: LocationSuggestion[] = data.map((m) => ({
          name: m.Nom,
          type: 'Municipi',
          region: m['Nom comarca'],
          code: m.Codi,
          county_code: m['Codi comarca'],
        }));

        const countiesMap = new Map<number, LocationSuggestion>();
        data.forEach((m) => {
          if (!countiesMap.has(m['Codi comarca'])) {
            countiesMap.set(m['Codi comarca'], {
              name: m['Nom comarca'],
              type: 'Comarca',
              region: 'Catalunya',
              code: m['Codi comarca'],
            });
          }
        });
        const counties = Array.from(countiesMap.values());

        // Resolve location name from search params
        const { municipality_code, county_code, location, guests: guestsParam } = searchParams;
        
        if (municipality_code && typeof municipality_code === "string") {
          const municipality = municipalities.find(m => m.code === Number(municipality_code));
          if (municipality) setLocationName(municipality.name);
        } else if (county_code && typeof county_code === "string") {
          const county = counties.find(c => c.code === Number(county_code));
          if (county) setLocationName(county.name);
        } else if (location && typeof location === "string") {
          setLocationName(location);
        }

        if (guestsParam && typeof guestsParam === "string") {
          setGuests(Number(guestsParam));
        }
      });
  }, [searchParams]);

  // Get search parameters
  const { check_in, check_out, types } = searchParams;
  const checkInDate = typeof check_in === "string" ? check_in : "";
  const checkOutDate = typeof check_out === "string" ? check_out : "";
  const selectedTypes = typeof types === "string" ? types.split(",") : [];
  
  // Use imported accommodation types
  const accommodationTypes = ACCOMMODATION_TYPES;

  // Amenities options
  const amenitiesOptions = [
    { id: "wifi", name: "WiFi", icon: Wifi },
    { id: "parking", name: "Aparcament", icon: Car },
    { id: "restaurant", name: "Restaurant", icon: Coffee },
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4">
        {/* Top Bar with Back Button and Main Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tornar
              </Button>
            </Link>

            <div className="text-sm text-gray-600 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{locationName || "Qualsevol destinació"}</span>
              </div>
              {checkInDate && checkOutDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(checkInDate).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })} - {new Date(checkOutDate).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{guests} {guests === 1 ? "persona" : "persones"}</span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border-gray-300 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Results Count and Types */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {resultsCount > 0 ? `${resultsCount} allotjaments` : "Allotjaments"}{locationName ? ` a ${locationName}` : ""}
            </h1>
            
            {selectedTypes.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedTypes.map(typeId => {
                  const type = accommodationTypes.find(t => t.id === typeId);
                  return type ? (
                    <Badge key={typeId} variant="secondary" className="bg-gray-100 text-gray-700 flex items-center gap-1">
                      <type.icon className="w-3 h-3" />
                      {type.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 hidden md:block">
            Allotjaments verificats legalment per la Generalitat de Catalunya
          </p>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Preu per nit
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Min" 
                      type="number" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="h-9 text-sm"
                    />
                    <Input 
                      placeholder="Max" 
                      type="number" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">€{priceRange[0]} - €{priceRange[1]}</div>
                </div>
              </div>

              {/* Guest Capacity */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Capacitat
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 disabled:opacity-25 transition-colors"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">
                    {guests}
                  </span>
                  <button
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 transition-colors"
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Categoria mínima
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                        selectedRating === rating
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">
                  Serveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesOptions.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedAmenities.includes(amenity.id)
                          ? "bg-gray-900 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <amenity.icon className="w-3 h-3" />
                      {amenity.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline transition-colors"
                onClick={() => {
                  setGuests(2);
                  setPriceRange([0, 500]);
                  setSelectedAmenities([]);
                  setSelectedRating(null);
                }}
              >
                Netejar filtres
              </button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Aplicar filtres
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
