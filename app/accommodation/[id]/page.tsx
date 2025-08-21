import { AccommodationDetail } from "@/components/accommodation-detail"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import { fetchDoc } from "@/lib/firestore"
import { Place } from "@/lib/place"
import { getAccommodationById } from "@/lib/mock-data"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AccommodationPageProps {
  params: {
    id: string
  }
}

export default async function AccommodationPage({ params }: AccommodationPageProps) {
  // Try to fetch the accommodation from Firestore first
  let firestoreAccommodation: Place | null = null;
  
  try {
    firestoreAccommodation = await fetchDoc<Place>("places", params.id);
  } catch (error) {
    console.error("Error fetching accommodation:", error);
  }

  // If found in Firestore, we need to convert it to the expected format
  if (firestoreAccommodation) {
    // For now, redirect to a basic info page or show a message
    // TODO: Update AccommodationDetail component to work with Place type
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/results" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Tornar als resultats
            </Link>
            
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                  {firestoreAccommodation.name && firestoreAccommodation.name !== "Sense especificar"
                    ? firestoreAccommodation.name
                    : firestoreAccommodation.address || "Allotjament sense nom"}
                </h1>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Ubicació</h3>
                    <p className="text-muted-foreground">
                      {[firestoreAccommodation.municipality, firestoreAccommodation.province]
                        .filter(Boolean)
                        .join(", ") || "Ubicació no especificada"}
                    </p>
                  </div>
                  
                  {firestoreAccommodation.type && (
                    <div>
                      <h3 className="font-semibold mb-2">Tipus</h3>
                      <p className="text-muted-foreground">{firestoreAccommodation.type}</p>
                    </div>
                  )}
                  
                  {firestoreAccommodation.licence_id && (
                    <div>
                      <h3 className="font-semibold mb-2">Llicència</h3>
                      <p className="text-muted-foreground">{firestoreAccommodation.licence_id}</p>
                    </div>
                  )}
                  
                  {firestoreAccommodation.total_places && (
                    <div>
                      <h3 className="font-semibold mb-2">Capacitat</h3>
                      <p className="text-muted-foreground">{firestoreAccommodation.total_places} persones</p>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Nota:</strong> Aquesta és una vista simplificada. 
                      Les dades completes i reserves estaran disponibles aviat.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If not found in Firestore, try the mock data as fallback
  const numericId = Number.parseInt(params.id);
  if (!isNaN(numericId)) {
    const mockAccommodation = getAccommodationById(numericId);
    if (mockAccommodation) {
      return (
        <>
          <AccommodationDetail accommodation={mockAccommodation} />
          <Footer />
        </>
      );
    }
  }

  // Not found in either source
  notFound();
}
