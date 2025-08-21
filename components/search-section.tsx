"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Minus, Search, X, Home } from "lucide-react";
import { ACCOMMODATION_TYPES } from "@/lib/accommodation-types";

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

export function SearchSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  // Total guests (previously split adults/children)
  const [guests, setGuests] = useState(2);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  
  // Refs for click outside detection
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const guestDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["tots"]);
  // Date inputs commented out for now
  // const [checkIn, setCheckIn] = useState("");
  // const [checkOut, setCheckOut] = useState("");
  
  // Animation states
  const [searchCardVisible, setSearchCardVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Wait longer to appear after platform logos finish (logos finish around 1640ms, so we wait until 2000ms)
          setTimeout(() => setSearchCardVisible(true), 1600);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Click outside detection and keyboard handling for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLocationSuggestions(false);
        setShowGuestSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
              region: 'Catalunya', // Or determine province if possible
              code: m['Codi comarca'],
            });
          }
        });
        const counties = Array.from(countiesMap.values());

        const hardcodedZones: LocationSuggestion[] = [
          { name: "Barcelona", type: "Zona", region: "Barcelona" },
          { name: "Costa Barcelona", type: "Zona", region: "Barcelona" },
          { name: "Costa Brava", type: "Zona", region: "Girona" },
          { name: "Costa Daurada", type: "Zona", region: "Tarragona" },
          { name: "Paisatges Barcelona", type: "Zona", region: "Barcelona" },
          { name: "Pirineus", type: "Zona", region: "Lleida" },
          { name: "Terres de l'Ebre", type: "Zona", region: "Tarragona" },
          { name: "Terres de L'Ebre", type: "Zona", region: "Tarragona" },
          { name: "Terres de Lleida", type: "Zona", region: "Lleida" },
          { name: "Val d'Aran", type: "Zona", region: "Lleida" },
          { name: "Val D'Aran", type: "Zona", region: "Lleida" },
        ];

        setLocationSuggestions([...municipalities, ...counties, ...hardcodedZones]);
      });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedLocation) {
      if (selectedLocation.type === 'Municipi' && selectedLocation.code) {
        params.set('municipality_code', selectedLocation.code.toString());
      } else if (selectedLocation.type === 'Comarca' && selectedLocation.code) {
        params.set('county_code', selectedLocation.code.toString());
      } else {
        // For zones like Costa Brava, Pirineus
        params.set('location', selectedLocation.name);
      }
    } else if (location) {
      // Fallback for free text entry
      params.set('location', location);
    }

    // Date inputs commented out for now
    // if (checkIn) params.set('check_in', checkIn);
    // if (checkOut) params.set('check_out', checkOut);
    // Unified guests param (replaces adults/children)
    params.set('guests', guests.toString());
    
    if (selectedTypes.length > 0 && !selectedTypes.includes('tots')) {
      params.set('types', selectedTypes.join(','));
    }

    router.push(`/results?${params.toString()}`);
  };

  // Add "tots" option to the accommodation types
  const accommodationTypes = [
    { id: "tots", name: "Tots els tipus", icon: Home },
    ...ACCOMMODATION_TYPES
  ];

  const filteredSuggestions = location
    ? locationSuggestions
        .filter(
          (suggestion) =>
            suggestion.name.toLowerCase().includes(location.toLowerCase()) ||
            suggestion.region.toLowerCase().includes(location.toLowerCase())
        )
        .sort((a, b) => {
          const searchTerm = location.toLowerCase();
          
          // Calculate match scores for better ranking
          const getMatchScore = (suggestion: LocationSuggestion) => {
            const name = suggestion.name.toLowerCase();
            const region = suggestion.region.toLowerCase();
            
            // Exact match gets highest score
            if (name === searchTerm) return 1000;
            
            // Starts with search term gets high score
            if (name.startsWith(searchTerm)) return 500;
            
            // Region exact match
            if (region === searchTerm) return 400;
            
            // Region starts with search term
            if (region.startsWith(searchTerm)) return 300;
            
            // Contains search term in name
            if (name.includes(searchTerm)) return 200;
            
            // Contains search term in region
            if (region.includes(searchTerm)) return 100;
            
            return 0;
          };
          
          const scoreA = getMatchScore(a);
          const scoreB = getMatchScore(b);
          
          // Sort by score (descending), then by name length (ascending for same scores)
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          
          return a.name.length - b.name.length;
        })
        .slice(0, 8)
    : [];

  const toggleAccommodationType = (typeId: string) => {
    if (typeId === "tots") {
      // Don't allow deselecting "tots" if it's the only one selected
      if (selectedTypes.length === 1 && selectedTypes.includes("tots")) {
        return;
      }
      // If "tots" is clicked and other types are selected, clear all others and keep only "tots"
      setSelectedTypes(["tots"]);
    } else {
      setSelectedTypes((prev) => {
        // Remove "tots" if it was selected and we're selecting a specific type
        const newTypes = prev.filter((id) => id !== "tots");

        if (newTypes.includes(typeId)) {
          // Remove the type if it's already selected
          const updatedTypes = newTypes.filter((id) => id !== typeId);
          // If no types are left, select "tots"
          return updatedTypes.length === 0 ? ["tots"] : updatedTypes;
        } else {
          // Add the type
          return [...newTypes, typeId];
        }
      });
    }
  };

  const totalGuests = guests;

  return (
    <section ref={sectionRef} className="relative px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 z-50 -mt-8 sm:-mt-12 md:-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border p-2 sm:p-3 transition-all duration-1000 ease-out ${
          searchCardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
        }`}>
          {/* Accommodation Types Row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 p-3 sm:p-4 border-b border-gray-100">
            {accommodationTypes.map((type, index) => (
              <button
                key={type.id}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium cursor-pointer
                  transition-[background-color,color,box-shadow] duration-150
                  ${selectedTypes.includes(type.id)
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                }`}
                style={{ 
                  opacity: searchCardVisible ? 1 : 0,
                  transform: searchCardVisible ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 1000ms ease-out ${400 + index * 100}ms, transform 1000ms ease-out ${400 + index * 100}ms, background-color 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out`
                }}
                onClick={() => toggleAccommodationType(type.id)}
              >
                <type.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">{type.name}</span>
                <span className="xs:hidden sm:hidden">
                  {type.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Main Search Controls */}
          <div className={`flex flex-col lg:flex-row lg:divide-x divide-gray-200 transition-all duration-1000 ease-out delay-700 ${
            searchCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Location Search with Autocomplete */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-gray-200" ref={locationDropdownRef}>
              <div className="p-4 sm:p-5 lg:p-6 hover:bg-gray-50 lg:rounded-l-2xl cursor-pointer transition-colors">
                <div className="text-xs font-semibold text-gray-900 mb-2">
                  On
                </div>
                <input
                  placeholder="Cerca destinacions"
                  className="w-full text-base sm:text-base text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (e.target.value === "") {
                      setSelectedLocation(null);
                    }
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                />
              </div>

              {showLocationSuggestions && location && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg sm:rounded-2xl shadow-xl mt-2 overflow-hidden max-h-80 overflow-y-auto" style={{ zIndex: 1000 }}>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                        onClick={() => {
                          setLocation(suggestion.name);
                          setSelectedLocation(suggestion);
                          setShowLocationSuggestions(false);
                        }}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {suggestion.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">
                              {suggestion.region}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-gray-50 ml-2 flex-shrink-0">
                          {suggestion.type}
                        </Badge>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 text-sm sm:text-base">
                      No s&apos;han trobat resultats
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guest Selector */}
            <div className="relative" ref={guestDropdownRef}>
              <div className="p-4 sm:p-5 lg:p-6 hover:bg-gray-50 lg:rounded-r-2xl cursor-pointer transition-colors flex items-center justify-between">
                <div onClick={() => setShowGuestSelector(!showGuestSelector)} className="flex-grow">
                  <div className="text-xs font-semibold text-gray-900 mb-2">
                    Qui
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    {totalGuests} {totalGuests === 1 ? "persona" : "persones"}
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-rose-500 text-white p-3 sm:p-4 lg:p-5 rounded-full hover:bg-rose-600 transition-colors ml-4 flex-shrink-0"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {showGuestSelector && (
                <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg sm:rounded-2xl shadow-xl mt-2 p-4 sm:p-6 w-72 sm:w-80" style={{ zIndex: 1000 }}>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Persones</div>
                        <div className="text-xs sm:text-sm text-gray-500">Nombre total de persones</div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                        >
                          <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                        <span className="w-6 text-center font-medium text-gray-900 text-sm sm:text-base">
                          {guests}
                        </span>
                        <button
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                          onClick={() => setGuests(Math.min(50, guests + 1))}
                        >
                          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      className="text-xs sm:text-sm font-medium text-gray-900 underline hover:text-gray-700"
                      onClick={() => setShowGuestSelector(false)}
                    >
                      Tancar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        {selectedTypes.length > 0 && !selectedTypes.includes("tots") && (
          <div className={`mt-6 sm:mt-8 cursor-pointer text-center transition-all duration-500 ease-out ${
            searchCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '1000ms' }}>
            <button
              className="cursor-pointer inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setSelectedTypes([])}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Netejar filtres
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
