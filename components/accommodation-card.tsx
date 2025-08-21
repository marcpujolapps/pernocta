"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  Home,
  Hotel,
  Tent,
  Trees,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Place } from "@/lib/place";
import { hereGeocode } from "@/helpers/geocode";
import { updateDocument } from "@/lib/firestore";

interface AccommodationCardProps {
  accommodation: Place;
  accommodationId: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export function AccommodationCard({
  accommodation,
  accommodationId,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: AccommodationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image state when accommodation images change
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentImageIndex(0);
  }, [accommodation.images]);

  // Navigation functions for image carousel
  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (accommodation.images && accommodation.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? accommodation.images!.length - 1 : prev - 1
      );
      setImageLoaded(false);
    }
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (accommodation.images && accommodation.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === accommodation.images!.length - 1 ? 0 : prev + 1
      );
      setImageLoaded(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (accommodation.images && accommodation.images.length > 1) {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
          prev === 0 ? accommodation.images!.length - 1 : prev - 1
        );
        setImageLoaded(false);
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
          prev === accommodation.images!.length - 1 ? 0 : prev + 1
        );
        setImageLoaded(false);
      }
    }
  };

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

  const handleLocate = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("Manual geocode attempt", accommodation);
    if (isLocating || accommodation.geocode_error) return;
    setIsLocating(true);
    try {
      // Build comprehensive address string for geocoding
      const addressParts = [];

      // Build street address
      const streetParts = [];
      if (accommodation.street_type)
        streetParts.push(accommodation.street_type);
      if (accommodation.street_name)
        streetParts.push(accommodation.street_name);
      if (accommodation.number)
        streetParts.push(accommodation.number.toString());

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
      if (accommodation.municipality)
        addressParts.push(accommodation.municipality);
      if (accommodation.province) addressParts.push(accommodation.province);

      const addressString = addressParts.filter(Boolean).join(", ");

      if (!addressString) {
        console.log("No address available for geocoding");
        // Mark as geocoding error to avoid future attempts
        await updateDocument("places", accommodationId, {
          geocode_error: true,
        });
        return;
      }

      console.log("Geocoding address:", addressString);

      const result = await hereGeocode(addressString);

      if (result && typeof result === "object" && "position" in result) {
        const geocodeResult = result as {
          position: { lat: number; lng: number };
        };
        const position = geocodeResult.position;
        console.log(
          "Coordinates for",
          accommodation.name ||
            accommodation.address ||
            accommodation.licence_id,
          {
            latitude: position.lat,
            longitude: position.lng,
            address: addressString,
            fullResult: result,
          }
        );
        // update accommodation coordinates
        await updateDocument("places", accommodationId, {
          coordinates: [position.lng, position.lat],
          geocode_error: false, // Clear any previous error flag
        });
        accommodation.coordinates = [position.lng, position.lat];
      } else {
        console.log("Unexpected geocoding result:", result);
        // Mark as geocoding error
        await updateDocument("places", accommodationId, {
          geocode_error: true,
        });
      }
    } catch (err) {
      console.error(
        "Geocoding error for",
        accommodation.name || accommodation.address,
        err
      );
      // Mark as geocoding error in Firestore
      try {
        await updateDocument("places", accommodationId, {
          geocode_error: true,
        });
      } catch (updateErr) {
        console.error("Failed to update geocode_error flag:", updateErr);
      }
    } finally {
      setIsLocating(false);
    }
  };

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
      style={{
        paddingTop: "0",
        paddingBottom: "0",
      }}
      className={`group relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 bg-white rounded-xl ${
        isSelected ? "ring-2 ring-rose-500 shadow-lg" : "hover:shadow-lg"
      } ${isHovered ? "shadow-md" : ""}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Image placeholder with gradient overlay */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 overflow-hidden rounded-t-xl">
        {/* Display current image if available */}
        {accommodation.images && accommodation.images.length > 0 && !imageError && (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">
                <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={accommodation.images[currentImageIndex]}
              alt={accommodation.name || "Accommodation"}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log('Image failed to load:', accommodation.images?.[currentImageIndex]);
                setImageError(true);
              }}
            />
            
            {/* Navigation buttons - only show when there are multiple images and card is hovered */}
            {accommodation.images.length > 1 && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Image indicator dots - smart display based on number of images */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  {accommodation.images.length <= 5 ? (
                    // Show all dots if 5 or fewer images
                    accommodation.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                          setImageLoaded(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))
                  ) : accommodation.images.length <= 10 ? (
                    // Show sliding window of dots for 6-10 images
                    <>
                      {Array.from({ length: Math.min(5, accommodation.images.length) }, (_, i) => {
                        const maxStart = (accommodation.images?.length || 0) - 5;
                        const start = Math.max(0, Math.min(maxStart, currentImageIndex - 2));
                        const actualIndex = start + i;
                        
                        return (
                          <button
                            key={actualIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(actualIndex);
                              setImageLoaded(false);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              actualIndex === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        );
                      })}
                    </>
                  ) : (
                    // Show position indicator for many images (11+)
                    <div className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {accommodation.images.length}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        {/* Show icon for accommodations without meaningful names */}
        {accommodation.name === "Sense especificar" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="w-12 h-12 text-rose-300" />
          </div>
        )}
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 shadow-sm z-30"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite
                ? "fill-rose-500 text-rose-500"
                : "text-gray-600 hover:text-rose-500"
            }`}
          />
        </button>

        {/* License badge */}
        {accommodation.licence_id && accommodation.licence_id !== "—" && (
          <div className="absolute bottom-2 left-2 z-30">
            <Badge className="bg-white/95 hover:bg-white text-gray-700 text-xs font-medium px-2 py-1 backdrop-blur-sm border-0">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              {accommodation.licence_id}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-1">
        {/* Location and rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
          {accommodation.name && accommodation.name !== "Sense especificar"
            ? accommodation.name
            : accommodation.address || "Sense nom"}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-green-800"><ShieldCheck className="w-3 h-3" /></span>
            <span className="text-green-800">{accommodation.licence_id}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-600 line-clamp-1">
            {[accommodation.municipality, accommodation.province]
              .filter(Boolean)
              .join(", ") || "Ubicació no especificada"}
        </h3>

        {/* Type and capacity */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <TypeIcon className="w-3 h-3" />
          <span className="truncate">
            {accommodation.type && accommodation.type !== "—"
              ? accommodation.type
              : "Allotjament"}
          </span>
          {accommodation.total_places && accommodation.total_places > 0 && (
            <>
              <span>•</span>
              <Users className="w-3 h-3" />
              <span>{accommodation.total_places}</span>
            </>
          )}
        </div>

        {/* Date range placeholder */}
        {/* <div className="text-xs text-gray-500">15–20 ago</div> */}

        {/* Price */}
        {/* <div className="flex items-baseline gap-1 pt-1">
          <span className="text-sm font-semibold text-gray-900">€123</span>
          <span className="text-xs text-gray-500">nit</span>
        </div> */}

        {/* Hidden action buttons - only show on hover for development */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEnrich}
            disabled={isEnriching}
            className="text-xs h-6 px-2"
          >
            {isEnriching ? "..." : "Enriquir"}
          </Button>
          {!accommodation.coordinates && !accommodation.geocode_error && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={handleLocate}
              disabled={isLocating}
            >
              {isLocating ? "..." : "Ubicar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
