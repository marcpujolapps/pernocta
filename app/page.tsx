import { Hero } from "@/components/hero"
import { SearchSection } from "@/components/search-section"
import { PlatformLogos } from "@/components/platform-logos"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <SearchSection />
      <PlatformLogos />
      {/* <FeaturedAccommodations /> */}
      <Footer />
    </main>
  )
}
