"use client";

import { fetchCollectionPage, Filter, updateDocument } from "@/lib/firestore";
import { useEffect, useState, use, useRef, useCallback } from "react";
import { AccommodationCard } from "@/components/accommodation-card";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import type { Place } from "@/lib/place";
import { hereGeocode } from "@/helpers/geocode";

// Represent a place with its Firestore document ID
type AccommodationItem = Place & { id: string };

export function ResultsLayout({
  searchParamsPromise,
  onResultsCount,
}: {
  searchParamsPromise: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
  onResultsCount?: (count: number) => void;
}) {
  const searchParams = use(searchParamsPromise);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
  const [selectedAccommodation, setSelectedAccommodation] = useState<
    string | null
  >(null);
  const [hoveredAccommodation, setHoveredAccommodation] = useState<
    string | null
  >(null);

  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  // Geocoding queue management
  const geocodingQueueRef = useRef<AccommodationItem[]>([]);
  const isGeocodingRef = useRef(false);

  // Image fetching queue management
  const imageQueueRef = useRef<AccommodationItem[]>([]);
  const isFetchingImagesRef = useRef(false);

  // Process geocoding queue with concurrent requests
  const processGeocodingQueue = useCallback(async () => {
    if (isGeocodingRef.current || geocodingQueueRef.current.length === 0) {
      return;
    }

    isGeocodingRef.current = true;

    // Process up to 20 items concurrently
    const batchSize = Math.min(20, geocodingQueueRef.current.length);
    const batch = geocodingQueueRef.current.splice(0, batchSize);

    const geocodePromises = batch.map(async (item) => {
      try {
        // Build comprehensive address string for geocoding
        const addressParts = [];

        // Build street address
        const streetParts = [];
        if (item.street_type) streetParts.push(item.street_type);
        if (item.street_name) streetParts.push(item.street_name);
        if (item.number) streetParts.push(item.number.toString());

        if (streetParts.length > 0) {
          const streetAddress = streetParts.join(" ");
          addressParts.push(streetAddress);
        } else if (item.address) {
          addressParts.push(item.address);
        }

        // Add postal code
        if (item.postal_code) {
          addressParts.push(item.postal_code);
        }

        // Add municipality and province
        if (item.municipality) addressParts.push(item.municipality);
        if (item.province) addressParts.push(item.province);

        const addressString = addressParts.filter(Boolean).join(", ");

        if (!addressString) {
          console.log(
            "No address available for geocoding:",
            item.name || item.licence_id
          );
          await updateDocument("places", item.id, {
            geocode_error: true,
          });
        } else {
          console.log(
            "Auto-geocoding:",
            item.name || item.address || item.licence_id,
            "-",
            addressString
          );

          const result = await hereGeocode(addressString);

          if (result && typeof result === "object" && "position" in result) {
            const geocodeResult = result as {
              position: { lat: number; lng: number };
            };
            const position = geocodeResult.position;

            await updateDocument("places", item.id, {
              coordinates: [position.lng, position.lat],
              geocode_error: false,
            });

            // Update local state
            setAccommodations((prev) =>
              prev.map((acc) =>
                acc.id === item.id
                  ? { ...acc, coordinates: [position.lng, position.lat], geocode_error: false }
                  : acc
              )
            );

            console.log(
              "Geocoded successfully:",
              item.name || item.licence_id,
              position
            );
          } else {
            console.log(
              "Unexpected geocoding result for",
              item.name || item.licence_id,
              result
            );
            await updateDocument("places", item.id, {
              geocode_error: true,
            });
          }
        }
      } catch (err) {
        console.error("Geocoding error for", item.name || item.address, err);
        try {
          await updateDocument("places", item.id, {
            geocode_error: true,
          });
        } catch (updateErr) {
          console.error("Failed to update geocode_error flag:", updateErr);
        }
      }
    });

    try {
      await Promise.all(geocodePromises);
    } catch (err) {
      console.error("Batch geocoding error:", err);
    } finally {
      isGeocodingRef.current = false;

      // Continue processing if there are more items in the queue
      if (geocodingQueueRef.current.length > 0) {
        processGeocodingQueue();
      }
    }
  }, []);

  // Process image fetching queue with concurrent requests
  const processImageQueue = useCallback(async () => {
    if (isFetchingImagesRef.current || imageQueueRef.current.length === 0) {
      return;
    }

    isFetchingImagesRef.current = true;

    // Process up to 20 items concurrently
    const batchSize = Math.min(20, imageQueueRef.current.length);
    const batch = imageQueueRef.current.splice(0, batchSize);

    const imagePromises = batch.map(async (item) => {
      try {
        // Build a meaningful query - avoid "Sense especificar" and other non-descriptive names
        let query = "";
        
        if (item.name && item.name !== "Sense especificar" && item.name.trim() !== "") {
          query = item.name;
        } else if (item.address && item.address.trim() !== "") {
          query = item.address;
        } else {
          // If no meaningful name or address, mark as error to avoid future attempts
          await updateDocument("places", item.id, {
            get_images_error: true,
          });
          return;
        }
        
        // Add type to improve search results
        if (item.type) {
          query += ` ${item.type}`;
        }
        
        // Add location context to improve search results
        if (item.municipality) {
          query += ` ${item.municipality}`;
        }
        
        console.log(
          "Auto-fetching images for:",
          item.name || item.address || item.licence_id,
          "-",
          query
        );

        const res = await fetch(`/api/get-image?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Get image failed", { status: res.status, data });
          await updateDocument("places", item.id, {
            get_images_error: true,
          });
        } else {
          console.log(
            "Images fetched successfully for:",
            item.name || item.licence_id,
            data.map((img: { url: string }) => img.url)
          );
          
          // Store the image URLs in the document
          await updateDocument("places", item.id, {
            images: data.map((img: { url: string }) => img.url),
            get_images_error: false,
          });

          // Update local state
          setAccommodations((prev) =>
            prev.map((acc) =>
              acc.id === item.id
                ? { 
                    ...acc, 
                    images: data.map((img: { url: string }) => img.url),
                    get_images_error: false 
                  }
                : acc
            )
          );
        }
      } catch (err) {
        console.error("Image fetching error for", item.name || item.address, err);
        try {
          await updateDocument("places", item.id, {
            get_images_error: true,
          });
        } catch (updateErr) {
          console.error("Failed to update get_images_error flag:", updateErr);
        }
      }
    });

    try {
      await Promise.all(imagePromises);
    } catch (err) {
      console.error("Batch image fetching error:", err);
    } finally {
      isFetchingImagesRef.current = false;

      // Continue processing if there are more items in the queue
      if (imageQueueRef.current.length > 0) {
        processImageQueue();
      }
    }
  }, []);

  // Add accommodations to geocoding queue
  const queueAccommodationsForGeocoding = useCallback((items: AccommodationItem[]) => {
    const itemsNeedingGeocoding = items.filter(
      (item) => !item.coordinates && !item.geocode_error
    );

    if (itemsNeedingGeocoding.length > 0) {
      console.log(
        `Queueing ${itemsNeedingGeocoding.length} items for geocoding`
      );
      geocodingQueueRef.current = [
        ...geocodingQueueRef.current,
        ...itemsNeedingGeocoding,
      ];

      // Start processing if not already running
      if (!isGeocodingRef.current) {
        processGeocodingQueue();
      }
    }
  }, [processGeocodingQueue]);

  // Add accommodations to image fetching queue
  const queueAccommodationsForImageFetching = useCallback((items: AccommodationItem[]) => {
    const itemsNeedingImages = items.filter(
      (item) => !item.images && 
                !item.get_images_error &&
                item.name !== "Sense especificar" &&
                (item.name || item.address) // Only fetch if we have a meaningful name or address
    );

    if (itemsNeedingImages.length > 0) {
      console.log(
        `Queueing ${itemsNeedingImages.length} items for image fetching`
      );
      imageQueueRef.current = [
        ...imageQueueRef.current,
        ...itemsNeedingImages,
      ];

      // Start processing if not already running
      if (!isFetchingImagesRef.current) {
        processImageQueue();
      }
    }
  }, [processImageQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isGeocodingRef.current = false;
      geocodingQueueRef.current = [];
      isFetchingImagesRef.current = false;
      imageQueueRef.current = [];
    };
  }, []);

  // Load initial results
  useEffect(() => {
    let cancelled = false;

    // Function to build filters from search params
    const buildFilters = () => {
      const filters: Filter[] = [];
      const { municipality_code, county_code, location, types, guests } =
        searchParams;

      if (municipality_code && typeof municipality_code === "string") {
        filters.push({
          field: "municipality_code",
          op: "==",
          value: Number(municipality_code),
        });
      } else if (county_code && typeof county_code === "string") {
        filters.push({
          field: "county_code",
          op: "==",
          value: Number(county_code),
        });
      } else if (location && typeof location === "string") {
        // Fallback for zones or free text.
        // This might need a more complex search (e.g. Algolia) for robust free-text matching.
        // For now, we can filter by tourist brand for zones like "Costa Brava".
        filters.push({ field: "tourist_brand", op: "==", value: location });
      }

      if (types && typeof types === "string") {
        const typeList = types.split(",").filter((type) => type !== "tots"); // Filter out "tots" since it means all types
        if (typeList.length > 0) {
          filters.push({ field: "type", op: "in", value: typeList });
        }
      }

      // Add capacity filter based on total number of guests
      const totalGuests = guests ? Number(guests) : 2;
      if (totalGuests > 0) {
        filters.push({
          field: "total_places",
          op: ">=",
          value: totalGuests,
        });
      }

      return filters;
    };

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const filters = buildFilters();

        const page = await fetchCollectionPage<Place>("places", {
          filters,
          limit: 20,
          order: [{ field: "name", direction: "asc" }],
        });
        if (cancelled) return;

        setAccommodations(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(!!page.nextCursor);

        // Queue items for geocoding
        queueAccommodationsForGeocoding(page.items);
        
        // Queue items for image fetching
        queueAccommodationsForImageFetching(page.items);
        
        // Mark items with "Sense especificar" names to avoid future image fetching attempts
        const itemsWithGenericNames = page.items.filter(
          (item) => item.name === "Sense especificar" && !item.get_images_error
        );
        
        itemsWithGenericNames.forEach(async (item) => {
          try {
            await updateDocument("places", item.id, {
              get_images_error: true,
            });
          } catch (err) {
            console.error("Failed to mark generic name as image error:", err);
          }
        });

        // Notify parent about results count
        if (onResultsCount) {
          onResultsCount(page.items.length);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg || "Error carregant dades");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [searchParams, onResultsCount, queueAccommodationsForGeocoding, queueAccommodationsForImageFetching]);

  // Load more results function
  const loadMoreResults = async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      // Function to build filters from search params
      const buildFilters = () => {
        const filters: Filter[] = [];
        const { municipality_code, county_code, location, types, guests } =
          searchParams;

        if (municipality_code && typeof municipality_code === "string") {
          filters.push({
            field: "municipality_code",
            op: "==",
            value: Number(municipality_code),
          });
        } else if (county_code && typeof county_code === "string") {
          filters.push({
            field: "county_code",
            op: "==",
            value: Number(county_code),
          });
        } else if (location && typeof location === "string") {
          // Fallback for zones or free text.
          // This might need a more complex search (e.g. Algolia) for robust free-text matching.
          // For now, we can filter by tourist brand for zones like "Costa Brava".
          filters.push({ field: "tourist_brand", op: "==", value: location });
        }

        if (types && typeof types === "string") {
          const typeList = types.split(",").filter((type) => type !== "tots"); // Filter out "tots" since it means all types
          if (typeList.length > 0) {
            filters.push({ field: "type", op: "in", value: typeList });
          }
        }

        // Add capacity filter based on total number of guests
        const totalGuests = guests ? Number(guests) : 2;
        if (totalGuests > 0) {
          filters.push({
            field: "total_places",
            op: ">=",
            value: totalGuests,
          });
        }

        return filters;
      };

      const filters = buildFilters();

      const page = await fetchCollectionPage<Place>("places", {
        filters,
        limit: 20,
        order: [{ field: "name", direction: "asc" }],
        cursor: nextCursor,
      });

      setAccommodations((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setHasMore(!!page.nextCursor);

      // Queue new items for geocoding
      queueAccommodationsForGeocoding(page.items);
      
      // Queue new items for image fetching
      queueAccommodationsForImageFetching(page.items);
      
      // Mark items with "Sense especificar" names to avoid future image fetching attempts
      const itemsWithGenericNames = page.items.filter(
        (item) => item.name === "Sense especificar" && !item.get_images_error
      );
      
      itemsWithGenericNames.forEach(async (item) => {
        try {
          await updateDocument("places", item.id, {
            get_images_error: true,
          });
        } catch (err) {
          console.error("Failed to mark generic name as image error:", err);
        }
      });

      // Notify parent about updated results count
      if (onResultsCount) {
        onResultsCount(accommodations.length + page.items.length);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Error carregant més resultats");
    } finally {
      setLoadingMore(false);
    }
  };

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
            ? "hidden lg:block lg:w-3/5"
            : viewMode === "list"
            ? "w-full"
            : "w-full lg:w-3/5"
        } overflow-y-auto bg-white`}
      >
        <div className="p-3 lg:p-4">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Carregant resultats...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}
          {!loading && !error && accommodations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Cap resultat
            </div>
          )}

          {/* Compact grid layout for cards - 3 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
            {accommodations.map((accommodation) => {
              const accommodationId = accommodation.id;
              return (
                <AccommodationCard
                  key={accommodationId}
                  accommodation={accommodation}
                  accommodationId={accommodationId}
                  isSelected={selectedAccommodation === accommodationId}
                  isHovered={hoveredAccommodation === accommodationId}
                  onSelect={() => setSelectedAccommodation(accommodationId)}
                  onHover={() => setHoveredAccommodation(accommodationId)}
                  onLeave={() => setHoveredAccommodation(null)}
                />
              );
            })}
          </div>

          {accommodations.length > 0 && hasMore && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 shadow-sm border-gray-200"
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
            ? "hidden lg:block lg:w-2/5"
            : viewMode === "map"
            ? "w-full"
            : "hidden lg:block lg:w-2/5"
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
  );
}