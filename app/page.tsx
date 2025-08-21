import { Hero } from "@/components/hero"
import { SearchSection } from "@/components/search-section"
import { PlatformLogos } from "@/components/platform-logos"
import { Footer } from "@/components/footer"
import MapboxMap from "@/components/MapboxMap"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <SearchSection />
      <PlatformLogos />
      {/* <FeaturedAccommodations /> */}
      <Footer />
      <div style={{ width: "100vw", height: "100vh" }}>
        <MapboxMap
          initialLat={41.3851}
          initialLng={2.1734}
          initialZoom={12}
        />
      </div>
    </main>
  )
}
