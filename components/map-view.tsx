"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageSlider } from "@/components/ui/image-slider";
import {
  MapPin,
  Home,
  Hotel,
  Tent,
  Trees,
  Building,
  Users,
  X,
} from "lucide-react";
import MapGL, {
  Marker,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Place } from "@/lib/place";

// Represent a place with its Firestore document ID
type AccommodationItem = Place & { id: string };

interface MapViewProps {
  accommodations: AccommodationItem[];
  selectedAccommodation: string | null;
  hoveredAccommodation: string | null;
  onAccommodationSelect: (id: string) => void;
  onAccommodationHover: (id: string | null) => void;
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
    zoom: 8,
  });
  const mapRef = useRef<MapRef | null>(null);
  const router = useRouter();

  // Get appropriate icon based on accommodation type
  const getAccommodationIcon = (type: string | null) => {
    if (!type) return MapPin;

    const normalizedType = type.toLowerCase();

    if (normalizedType.includes("hotel")) return Hotel;
    if (
      normalizedType.includes("casa rural") ||
      normalizedType.includes("rural")
    )
      return Trees;
    if (
      normalizedType.includes("apartament") ||
      normalizedType.includes("apartment")
    )
      return Building;
    if (normalizedType.includes("camping") || normalizedType.includes("camp"))
      return Tent;
    if (normalizedType.includes("casa") || normalizedType.includes("home"))
      return Home;

    // Default fallback
    return MapPin;
  };

  // Calculate bounds based on accommodations
  useEffect(() => {
    if (accommodations.length > 0) {
      const accommodationsWithCoords = accommodations.filter(
        (a) => a.coordinates !== undefined
      );

      if (accommodationsWithCoords.length > 0 && mapRef.current) {
        const lats = accommodationsWithCoords.map((a) => a.coordinates![1]);
        const lngs = accommodationsWithCoords.map((a) => a.coordinates![0]);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Use Mapbox's fitBounds to automatically fit all markers
        mapRef.current.getMap().fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 50, // Add padding around the bounds
            duration: 1000, // Animation duration
          }
        );
      } else {
        // No accommodations have coordinates, use default location
        setViewState((prev) => ({
          ...prev,
          latitude: 41.99,
          longitude: 1.6,
        }));
      }
    } else {
      // No accommodations at all, use default location
      setViewState((prev) => ({
        ...prev,
        latitude: 41.99,
        longitude: 1.6,
      }));
    }
  }, [accommodations]);

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
        {accommodations
          .filter((accommodation) => accommodation.coordinates !== undefined)
          .map((accommodation) => {
            const accommodationId = accommodation.id;
            const isSelected = selectedAccommodation === accommodationId;
            const isHovered = hoveredAccommodation === accommodationId;
            const IconComponent = getAccommodationIcon(accommodation.type);

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
                  onClick={() => router.push(`/accommodation/${accommodationId}`)}
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
                      className={`px-2 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${
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
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 shadow-xl border border-gray-200 bg-white rounded-xl overflow-hidden cursor-pointer"
                        style={{
                          zIndex: isSelected ? 1001 : 501,
                          marginTop: 0,
                          paddingTop: 0,
                          marginBottom: 0,
                          paddingBottom: 0,
                        }}
                        onClick={() => router.push(`/accommodation/${accommodationId}`)}
                      >
                        {/* Close button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAccommodationSelect("");
                          }}
                          className="absolute top-2 right-2 z-40 bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-1 shadow-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Image section */}
                        <div className="relative">
                          <ImageSlider
                            images={accommodation.images || []}
                            altText={accommodation.name || "Accommodation"}
                            showNavigationOnHover={false}
                            showIndicators={true}
                            fallbackContent={
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Home className="w-8 h-8 text-rose-300" />
                              </div>
                            }
                          />

                          {/* License badge */}
                          {/* {accommodation.licence_id &&
                            accommodation.licence_id !== "—" && (
                              <div className="absolute bottom-2 left-2 z-30">
                                <div className="bg-white/95 hover:bg-white text-gray-700 text-xs font-medium px-2 py-1 backdrop-blur-sm border-0 rounded flex items-center gap-1">
                                  <IconComponent className="w-3 h-3 text-emerald-600" />
                                  {accommodation.licence_id}
                                </div>
                              </div>
                            )} */}
                        </div>

                        <CardContent className="p-3 pt-2 space-y-3">
                          {/* Name and location */}
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {accommodation.name &&
                              accommodation.name !== "Sense especificar"
                                ? accommodation.name
                                : accommodation.address || "Sense nom"}
                            </h4>
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {[
                                accommodation.municipality,
                                accommodation.province,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Ubicació no especificada"}
                            </div>
                          </div>

                          {/* Type and capacity */}
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <IconComponent className="w-3 h-3" />
                            <span className="truncate">
                              {accommodation.type && accommodation.type !== "—"
                                ? accommodation.type
                                : "Allotjament"}
                            </span>
                            {accommodation.total_places &&
                              accommodation.total_places > 0 && (
                                <>
                                  <span>•</span>
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {accommodation.total_places} places
                                  </span>
                                </>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </Marker>
            );
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
            <Home className="w-4 h-4 text-muted-foreground" />
            <span>Apartament</span>
          </div>
          <div className="flex items-center gap-2">
            <Tent className="w-4 h-4 text-muted-foreground" />
            <span>Camping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
