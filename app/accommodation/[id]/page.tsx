import { AccommodationDetail } from "@/components/accommodation-detail"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import { getAccommodationById } from "@/lib/mock-data"

interface AccommodationPageProps {
  params: {
    id: string
  }
}

export default function AccommodationPage({ params }: AccommodationPageProps) {
  const accommodation = getAccommodationById(Number.parseInt(params.id))

  if (!accommodation) {
    notFound()
  }

  return (
    <>
      <AccommodationDetail accommodation={accommodation} />
      <Footer />
    </>
  )
}
