"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Heart,
  Home,
  Hotel,
  Tent,
  Trees,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { Place } from "@/lib/place";
import { hereGeocode } from "@/helpers/geocode";

interface AccommodationCardProps {
  accommodation: Place;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export function AccommodationCard({
  accommodation,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: AccommodationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleEnrich = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnriching) return;
    setIsEnriching(true);
    try {
      const payload = {
        place: {
          name: accommodation.name,
          municipality: accommodation.municipality,
          county: accommodation.county,
          province: accommodation.province,
          licence_id: accommodation.licence_id,
          address: accommodation.address,
          category: accommodation.category,
          modality: accommodation.modality,
          type: accommodation.type,
        },
      };
      const res = await fetch("/api/enrich-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Enrichment failed", { status: res.status, data });
      } else {
        console.log(
          "Enrichment result for",
          accommodation.name ||
            accommodation.address ||
            accommodation.licence_id,
          data
        );
      }
    } catch (err) {
      console.error("Enrichment error", err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleLocate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocating) return;
    setIsLocating(true);
    try {
      // Build comprehensive address string for geocoding
      const addressParts = [];
      
      // // Start with the accommodation name if available
      // if (accommodation.name && accommodation.name !== "Sense especificar") {
      //   addressParts.push(accommodation.name);
      // }
      
      // Build street address
      const streetParts = [];
      if (accommodation.street_type) streetParts.push(accommodation.street_type);
      if (accommodation.street_name) streetParts.push(accommodation.street_name);
      if (accommodation.number) streetParts.push(accommodation.number.toString());
      
      if (streetParts.length > 0) {
        const streetAddress = streetParts.join(" ");
        addressParts.push(streetAddress);
      } else if (accommodation.address) {
        // Fallback to the general address field
        addressParts.push(accommodation.address);
      }
      
      // Add postal code
      if (accommodation.postal_code) {
        addressParts.push(accommodation.postal_code);
      }
      
      // Add municipality and province
      if (accommodation.municipality) addressParts.push(accommodation.municipality);
      if (accommodation.province) addressParts.push(accommodation.province);
      
      const addressString = addressParts.filter(Boolean).join(", ");
      
      if (!addressString) {
        console.log("No address available for geocoding");
        return;
      }

      console.log("Geocoding address:", addressString);
      
      const result = await hereGeocode(addressString);
      
      if (result && typeof result === 'object' && 'position' in result) {
        const geocodeResult = result as { position: { lat: number; lng: number } };
        const position = geocodeResult.position;
        console.log("Coordinates for", accommodation.name || accommodation.address || accommodation.licence_id, {
          latitude: position.lat,
          longitude: position.lng,
          address: addressString,
          fullResult: result
        });
      } else {
        console.log("Unexpected geocoding result:", result);
      }
    } catch (err) {
      console.error("Geocoding error for", accommodation.name || accommodation.address, err);
    } finally {
      setIsLocating(false);
    }
  };

  const accommodationId =
    accommodation.licence_id || accommodation.slug || "unknown";

  // Map accommodation types to icons
  const getTypeIcon = (type: string) => {
    const typeIcons: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      "casa-rural": Trees,
      "cases rurals": Trees,
      apartament: Home,
      apartaments: Home,
      hotel: Hotel,
      hotels: Hotel,
      camping: Tent,
      càmpings: Tent,
    };

    const normalizedType = type?.toLowerCase() || "";
    for (const [key, IconComponent] of Object.entries(typeIcons)) {
      if (normalizedType.includes(key)) {
        return IconComponent;
      }
    }
    return Home; // Default icon
  };

  const TypeIcon = getTypeIcon(accommodation.type || "");

  return (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white ${
        isSelected
          ? "ring-2 ring-rose-500 shadow-xl scale-[1.02]"
          : "shadow-md hover:shadow-xl"
      } ${isHovered ? "shadow-lg scale-[1.01]" : ""} hover:-translate-y-1`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Image placeholder with gradient overlay */}
      <div className="relative h-48 bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "fill-rose-500 text-rose-500"
                : "text-gray-500 hover:text-rose-500"
            }`}
          />
        </button>

        {/* Type badge with icon */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm">
          <TypeIcon className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 capitalize">
            {accommodation.type && accommodation.type !== "—"
              ? accommodation.type
              : "Allotjament"}
          </span>
        </div>

        {/* License badge */}
        {accommodation.licence_id && accommodation.licence_id !== "—" && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs font-medium px-2 py-1 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {accommodation.licence_id}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header with title */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-rose-700 transition-colors">
            {accommodation.name && accommodation.name !== "Sense especificar"
              ? accommodation.name
              : accommodation.address || "Sense nom"}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">
            {[accommodation.municipality, accommodation.province]
              .filter(Boolean)
              .join(", ") || "Ubicació no especificada"}
          </span>
        </div>

        {/* Capacity and rooms */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {accommodation.total_places && accommodation.total_places > 0
                ? `Fins a ${accommodation.total_places} persones`
                : "Capacitat variable"}
            </span>
          </div>

          {accommodation.total_rooms && accommodation.total_rooms > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {accommodation.total_rooms}{" "}
                {accommodation.total_rooms === 1 ? "habitació" : "habitacions"}
              </span>
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="space-y-1">
          {accommodation.category && accommodation.category !== "—" && (
            <div className="text-xs text-gray-500">
              Categoria:{" "}
              <span className="font-medium text-gray-700">
                {accommodation.category}
              </span>
            </div>
          )}

          {accommodation.modality && accommodation.modality !== "—" && (
            <div className="text-xs text-gray-500">
              Modalitat:{" "}
              <span className="font-medium text-gray-700">
                {accommodation.modality}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEnrich}
            disabled={isEnriching}
            className="text-xs"
          >
            {isEnriching ? "..." : "Enriquir"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={handleLocate}
            disabled={isLocating}
          >
            {isLocating ? "..." : "Ubicar"}
          </Button>
          <Button
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
            asChild
          >
            <Link href={`/accommodation/${accommodationId}`}>Veure més</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
