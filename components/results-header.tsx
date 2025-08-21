"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Filter, ArrowLeft, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

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
        const { municipality_code, county_code, location } = searchParams;
        
        if (municipality_code && typeof municipality_code === "string") {
          const municipality = municipalities.find(m => m.code === Number(municipality_code));
          if (municipality) setLocationName(municipality.name);
        } else if (county_code && typeof county_code === "string") {
          const county = counties.find(c => c.code === Number(county_code));
          if (county) setLocationName(county.name);
        } else if (location && typeof location === "string") {
          setLocationName(location);
        }
      });
  }, [searchParams]);

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Get search parameters
  const { check_in, check_out, adults, children, types } = searchParams;
  const checkInDate = typeof check_in === "string" ? check_in : "";
  const checkOutDate = typeof check_out === "string" ? check_out : "";
  const adultCount = typeof adults === "string" ? Number(adults) : 2;
  const childCount = typeof children === "string" ? Number(children) : 0;
  const selectedTypes = typeof types === "string" ? types.split(",") : [];
  
  const totalGuests = adultCount + childCount;
  const dateRange = checkInDate && checkOutDate 
    ? `${formatDate(checkInDate)}-${formatDate(checkOutDate)}`
    : "Dates flexibles";

  // Map accommodation type IDs to display names
  const typeDisplayNames: { [key: string]: string } = {
    "casa-rural": "Cases rurals",
    "apartament": "Apartaments", 
    "hotel": "Hotels",
    "camping": "Càmpings"
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tornar
            </Button>
          </Link>

          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{locationName || "Qualsevol destinació"}</span>
              {checkInDate && checkOutDate && (
                <>
                  <span>•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{dateRange}</span>
                </>
              )}
              <span>•</span>
              <Users className="w-4 h-4" />
              <span>{totalGuests} {totalGuests === 1 ? "persona" : "persones"}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {resultsCount > 0 ? `${resultsCount} allotjaments` : "Allotjaments"}{locationName ? ` a ${locationName}` : ""}
            </h1>
            <p className="text-muted-foreground">Tots verificats legalment per la Generalitat de Catalunya</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedTypes.length > 0 && selectedTypes.map(typeId => (
              <Badge key={typeId} variant="secondary" className="bg-accent text-accent-foreground">
                <Filter className="w-3 h-3 mr-1" />
                {typeDisplayNames[typeId] || typeId}
              </Badge>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-card rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Capacitat</label>
                <div className="flex gap-2">
                  <Input placeholder="Min. places" className="h-9" type="number" min="1" />
                  <Input placeholder="Max. places" className="h-9" type="number" min="1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Categoria</label>
                <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option>Qualsevol categoria</option>
                  <option>1 estrella</option>
                  <option>2 estrelles</option>
                  <option>3 estrelles</option>
                  <option>4 estrelles</option>
                  <option>5 estrelles</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full h-9">Aplicar filtres</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
