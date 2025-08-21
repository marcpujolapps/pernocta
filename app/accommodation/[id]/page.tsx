import { AccommodationDetail } from "@/components/accommodation-detail";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";
import { fetchDoc } from "@/lib/firestore";
import { Place } from "@/lib/place";

interface AccommodationPageProps {
  params: {
    id: string;
  };
}

export default async function AccommodationPage({
  params,
}: AccommodationPageProps) {
  // Try to fetch the accommodation from Firestore
  let place: Place | null = null;

  try {
    place = await fetchDoc<Place>("places", params.id);
  } catch (error) {
    console.error("Error fetching accommodation:", error);
  }

  // If not found, show 404
  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetail place={{ ...place, createdAt: null }} />
      <Footer />
    </div>
  );
}
