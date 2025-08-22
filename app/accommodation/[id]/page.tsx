import { AccommodationDetail } from "@/components/accommodation-detail";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";
import { fetchDoc } from "@/lib/firestore";
import { Place } from "@/lib/place";

interface AccommodationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccommodationPage({
  params,
}: AccommodationPageProps) {
  // Await the params since they're now a Promise in Next.js 15
  const { id } = await params;

  // Try to fetch the accommodation from Firestore
  let place: Place | null = null;
  try {
    place = await fetchDoc<Place>("places", id);
    if (place) {
      place.createdAt = place?.createdAt?.seconds
        ? place.createdAt.seconds * 1000
        : null;
      place.enriched_at = place?.enriched_at?.seconds
        ? place.enriched_at.seconds * 1000
        : null;
    }
  } catch (error) {
    console.error("Error fetching accommodation:", error);
  }

  // If not found, show 404
  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetail place={place} placeId={id} />
      <Footer />
    </div>
  );
}
