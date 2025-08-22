/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageSlider } from "@/components/ui/image-slider";
import MapboxMap from "@/components/MapboxMap";
import { Place } from "@/lib/place";
import { updateDocument } from "@/lib/firestore";
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Bed,
  Shield,
  ExternalLink,
  Heart,
  Share,
  Building,
  Home,
  FileText,
  CheckCircle,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { vector } from "firebase/firestore";

interface AccommodationDetailProps {
  place: Place;
  placeId: string;
}

interface EnrichmentData {
  long_description: string | null;
  short_description: string | null;
  services: string[] | null;
  amenities: string[] | null;
  price_range_eur: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  booking_links: Array<{ platform: string; url: string }> | null;
  reviews_out_of_5: number | null;
  reviews_summary: string | null;
}

export function AccommodationDetail({
  place,
  placeId,
}: AccommodationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(
    null
  );
  const [isEnriching, setIsEnriching] = useState(false);

  // Load existing enrichment data on component mount
  useEffect(() => {
    if (place.enriched_at) {
      // Load existing enrichment data
      setEnrichmentData({
        long_description: place.long_description || null,
        short_description: place.short_description || null,
        services: place.services || null,
        amenities: place.amenities || null,
        price_range_eur: place.price_range_eur || null,
        website: place.website || null,
        email: place.email || null,
        phone: place.phone || null,
        booking_links: place.booking_links || null,
        reviews_out_of_5: place.reviews_out_of_5 || null,
        reviews_summary: place.reviews_summary || null,
      });
    }
  }, [place]);

  // Manual enrichment function
  const enrichPlace = async () => {
    if (isEnriching) return;

    setIsEnriching(true);
    try {
      const payload = {
        placeId: placeId,
        place: {
          name: place.name,
          municipality: place.municipality,
          county: place.county,
          province: place.province,
          licence_id: place.licence_id,
          address: place.address,
          category: place.category,
          modality: place.modality,
          type: place.type,
        },
      };

      const res = await fetch("/api/enrich-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Enrichment response data:", data);

      if (!res.ok) {
        console.error("Enrichment failed", { status: res.status, data });
        // Mark as enrichment error in Firestore
        try {
          await updateDocument("places", placeId, {
            enrichment_error: true,
            enriched_at: new Date(),
          });
        } catch (updateErr) {
          console.error("Failed to update enrichment_error flag:", updateErr);
        }
      } else {
        console.log(
          "Enrichment successful for",
          place.name || place.licence_id,
          data
        );
        setEnrichmentData(data.enrichment);

        // Save enrichment data to Firestore
        try {
          const enrichmentUpdate = {
            ...data.enrichment,
            enriched_at: new Date(),
            enrichment_error: false,
            embedding: vector(data.embedding),
          };

          await updateDocument("places", placeId, enrichmentUpdate);
        } catch (updateErr) {
          console.error(
            "Failed to save enrichment data to Firestore:",
            updateErr
          );
          // Continue even if Firestore update fails
        }
      }
    } catch (err) {
      console.error("Enrichment error", err);
      // Mark as enrichment error in Firestore
      try {
        await updateDocument("places", placeId, {
          enrichment_error: true,
          enriched_at: new Date(),
        });
      } catch (updateErr) {
        console.error(
          "Failed to update enrichment_error flag after error:",
          updateErr
        );
      }
    } finally {
      setIsEnriching(false);
    }
  };

  // Check if enrichment is available
  const canEnrich = !place.enrichment_error && !place.enriched_at;

  const hasEnrichmentData =
    enrichmentData &&
    (enrichmentData.long_description ||
      enrichmentData.short_description ||
      enrichmentData.services ||
      enrichmentData.amenities);

  // Build full address from Place data
  const fullAddress = [
    place.street_type,
    place.street_name,
    place.number,
    place.floor && `Pis ${place.floor}`,
    place.door && `Porta ${place.door}`,
    place.postal_code,
    place.municipality,
    place.province,
  ]
    .filter(Boolean)
    .join(", ");

  // Get accommodation type translation
  const getTypeTranslation = (type: string | null) => {
    if (!type) return "Allotjament";
    const translations: Record<string, string> = {
      "Casa rural": "Casa rural",
      "Apartament turístic": "Apartament",
      Hotel: "Hotel",
      "Habitatge d'ús turístic": "Habitatge turístic",
    };
    return translations[type] || type;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string | null) => {
    if (status === "Actiu") return "bg-green-100 text-green-800";
    if (status === "Baixa temporal") return "bg-yellow-100 text-yellow-800";
    if (status === "Baixa definitiva") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/results">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tornar als resultats
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
              Guardar
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and basic info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {place.name || "Allotjament sense nom"}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{place.municipality || place.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4" />
                  <span>Codi: {place.licence_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {getTypeTranslation(place.type)}
                </Badge>
                {place.status && (
                  <Badge className={getStatusBadgeColor(place.status)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {place.status}
                  </Badge>
                )}
                {place.category && (
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    {place.category}
                  </Badge>
                )}
                {place.modality && (
                  <Badge variant="outline">{place.modality}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enrichment Section */}
        {canEnrich && !hasEnrichmentData && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/25">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  Obtenir més informació
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enriqueix aquest allotjament amb descripcions, serveis,
                  comoditats i enllaços de reserva.
                </p>
              </div>
              <Button
                onClick={enrichPlace}
                disabled={isEnriching}
                className="ml-4"
              >
                {isEnriching ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2"></div>
                    Enriquint...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enriquir
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Enrichment Error Message */}
        {place.enrichment_error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">
                  Error d&apos;enriquiment
                </h3>
                <p className="text-sm text-red-600">
                  No s&apos;ha pogut obtenir informació adicional per aquest
                  allotjament. Pots intentar-ho de nou.
                </p>
              </div>
              <Button
                onClick={enrichPlace}
                disabled={isEnriching}
                variant="outline"
                className="ml-4 border-red-200 text-red-700 hover:bg-red-50"
              >
                {isEnriching ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full mr-2"></div>
                    Reintentant...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reintentar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {place.images && place.images.length > 0 ? (
          <div className="mb-8">
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              <ImageSlider
                images={place.images}
                altText={place.name || "Allotjament"}
                aspectRatio="aspect-auto"
                className="h-full"
                showNavigationOnHover={true}
                showIndicators={true}
                fallbackContent={
                  <div className="h-full bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Imatges no disponibles</p>
                    </div>
                  </div>
                }
              />
            </div>

            {place.images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                {place.images.slice(1, 7).map((image, index) => (
                  <div
                    key={index}
                    className="relative h-20 rounded overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${place.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {place.images.length > 7 && (
                  <div className="relative h-20 rounded overflow-hidden bg-black/50 flex items-center justify-center text-white font-medium">
                    +{place.images.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 h-96 md:h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Imatges no disponibles</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-6 mb-6 text-muted-foreground">
                {place.total_places && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{place.total_places} places</span>
                  </div>
                )}
                {place.total_rooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>{place.total_rooms} estances</span>
                  </div>
                )}
                {place.accommodation_unit && (
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <span>{place.accommodation_unit}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Detalls de la propietat
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground mb-3">
                    Informació general
                  </h3>

                  {place.type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tipus d&apos;establiment:
                      </span>
                      <span className="font-medium">{place.type}</span>
                    </div>
                  )}

                  {place.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categoria:</span>
                      <span className="font-medium">{place.category}</span>
                    </div>
                  )}

                  {place.modality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modalitat:</span>
                      <span className="font-medium">{place.modality}</span>
                    </div>
                  )}

                  {place.group && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grup:</span>
                      <span className="font-medium">{place.group}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground mb-3">
                    Capacitat
                  </h3>

                  {place.total_places && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Places totals:
                      </span>
                      <span className="font-medium">{place.total_places}</span>
                    </div>
                  )}

                  {place.total_rooms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estances:</span>
                      <span className="font-medium">{place.total_rooms}</span>
                    </div>
                  )}

                  {place.accommodation_unit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Unitat d&apos;allotjament:
                      </span>
                      <span className="font-medium">
                        {place.accommodation_unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Ubicació
              </h2>

              <div className="mb-4">
                <p className="text-muted-foreground mb-4">{fullAddress}</p>

                <div className="h-80 bg-muted rounded-lg overflow-hidden">
                  {place.coordinates ? (
                    <MapboxMap
                      initialLat={place.coordinates[1]}
                      initialLng={place.coordinates[0]}
                      initialZoom={15}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p>Ubicació no disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {place.municipality && (
                  <div>
                    <span className="text-muted-foreground">Municipi:</span>
                    <span className="ml-2 font-medium">
                      {place.municipality}
                    </span>
                  </div>
                )}
                {place.county && (
                  <div>
                    <span className="text-muted-foreground">Comarca:</span>
                    <span className="ml-2 font-medium">{place.county}</span>
                  </div>
                )}
                {place.province && (
                  <div>
                    <span className="text-muted-foreground">Província:</span>
                    <span className="ml-2 font-medium">{place.province}</span>
                  </div>
                )}
                {place.postal_code && (
                  <div>
                    <span className="text-muted-foreground">Codi postal:</span>
                    <span className="ml-2 font-medium">
                      {place.postal_code}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Enrichment Data */}
            {(hasEnrichmentData || isEnriching) && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Informació adicional
                    {isEnriching && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        (carregant...)
                      </span>
                    )}
                  </h2>

                  {isEnriching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center text-muted-foreground">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Enriquint la informació de l&apos;allotjament...</p>
                      </div>
                    </div>
                  ) : enrichmentData ? (
                    <div className="space-y-6">
                      {/* Description */}
                      {enrichmentData.long_description && (
                        <div>
                          <h3 className="font-medium text-foreground mb-3">
                            Descripció
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {enrichmentData.long_description}
                          </p>
                        </div>
                      )}

                      {/* Services & Amenities */}
                      {(enrichmentData.services ||
                        enrichmentData.amenities) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {enrichmentData.services && (
                            <div>
                              <h3 className="font-medium text-foreground mb-3">
                                Serveis
                              </h3>
                              <div className="space-y-2">
                                {enrichmentData.services.map(
                                  (service, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-muted-foreground">
                                        {service}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {enrichmentData.amenities && (
                            <div>
                              <h3 className="font-medium text-foreground mb-3">
                                Comoditats
                              </h3>
                              <div className="space-y-2">
                                {enrichmentData.amenities.map(
                                  (amenity, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-muted-foreground">
                                        {amenity}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact & Booking Info */}
                      {(enrichmentData.website ||
                        enrichmentData.email ||
                        enrichmentData.phone ||
                        enrichmentData.price_range_eur) && (
                        <div>
                          <h3 className="font-medium text-foreground mb-3">
                            Contacte i reserves
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrichmentData.website && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Web oficial:
                                </span>
                                <a
                                  href={enrichmentData.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-sm"
                                >
                                  Visitar web
                                </a>
                              </div>
                            )}
                            {enrichmentData.email && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Email:
                                </span>
                                <a
                                  href={`mailto:${enrichmentData.email}`}
                                  className="text-primary hover:underline text-sm"
                                >
                                  {enrichmentData.email}
                                </a>
                              </div>
                            )}
                            {enrichmentData.phone && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Telèfon:
                                </span>
                                <a
                                  href={`tel:${enrichmentData.phone}`}
                                  className="text-primary hover:underline text-sm"
                                >
                                  {enrichmentData.phone}
                                </a>
                              </div>
                            )}
                            {enrichmentData.price_range_eur && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Rang de preus:
                                </span>
                                <span className="font-medium text-sm">
                                  {enrichmentData.price_range_eur}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Booking Links */}
                      {enrichmentData.booking_links &&
                        enrichmentData.booking_links.length > 0 && (
                          <div>
                            <h3 className="font-medium text-foreground mb-3">
                              Plataformes de reserva
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {enrichmentData.booking_links.map(
                                (link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <span className="font-medium">
                                      {link.platform}
                                    </span>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                  </a>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Reviews */}
                      {(enrichmentData.reviews_out_of_5 ||
                        enrichmentData.reviews_summary) && (
                        <div>
                          <h3 className="font-medium text-foreground mb-3">
                            Valoracions
                          </h3>
                          {enrichmentData.reviews_out_of_5 && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i <
                                      Math.floor(
                                        enrichmentData.reviews_out_of_5!
                                      )
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">
                                {enrichmentData.reviews_out_of_5.toFixed(1)} de
                                5
                              </span>
                            </div>
                          )}
                          {enrichmentData.reviews_summary && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {enrichmentData.reviews_summary}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <Separator />
              </>
            )}

            {/* Administrative Information */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Informació administrativa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground mb-3">
                    Registre i llicències
                  </h3>

                  {place.licence_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Número d&apos;inscripció:
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {place.licence_id}
                      </span>
                    </div>
                  )}

                  {place.control_digit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Dígit de control:
                      </span>
                      <span className="font-medium">{place.control_digit}</span>
                    </div>
                  )}

                  {place.occupancy_certificate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Cèdula d&apos;habitabilitat:
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {place.occupancy_certificate}
                      </span>
                    </div>
                  )}

                  {place.cadastral_ref && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Referència cadastral:
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {place.cadastral_ref}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground mb-3">
                    Propietari/Gestor
                  </h3>

                  {place.holder_company_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Raó social:</span>
                      <span className="font-medium">
                        {place.holder_company_name}
                      </span>
                    </div>
                  )}

                  {(place.holder_name || place.holder_surname1) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titular:</span>
                      <span className="font-medium">
                        {[
                          place.holder_name,
                          place.holder_surname1,
                          place.holder_surname2,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </span>
                    </div>
                  )}

                  {place.tax_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CIF/NIF:</span>
                      <span className="font-mono text-sm font-medium">
                        {place.tax_id}
                      </span>
                    </div>
                  )}

                  {place.tourist_brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Marca turística:
                      </span>
                      <span className="font-medium">{place.tourist_brand}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact/Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-foreground">
                      Allotjament legal verificat
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estat:</span>
                      <Badge className={getStatusBadgeColor(place.status)}>
                        {place.status || "No especificat"}
                      </Badge>
                    </div>

                    {place.licence_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Número d&apos;inscripció:
                        </span>
                        <span className="font-mono text-xs">
                          {place.licence_id}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacitat:</span>
                      <span className="font-medium">
                        {place.total_places
                          ? `${place.total_places} places`
                          : "No especificada"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estances:</span>
                      <span className="font-medium">
                        {place.total_rooms
                          ? `${place.total_rooms} habitacions`
                          : "No especificat"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    size="lg"
                    className="w-full h-12 text-lg font-semibold"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Contactar propietari
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Aquest allotjament està registrat legalment a la Generalitat
                    de Catalunya
                  </p>

                  <div className="bg-muted/50 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">
                        Informació legal
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {place.territorial_unit && (
                        <p>Unitat territorial: {place.territorial_unit}</p>
                      )}
                      {place.municipality_code && (
                        <p>Codi municipi: {place.municipality_code}</p>
                      )}
                      {place.county_code && (
                        <p>Codi comarca: {place.county_code}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
