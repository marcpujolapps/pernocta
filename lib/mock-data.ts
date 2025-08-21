export interface Accommodation {
  id: number
  name: string
  location: string
  fullAddress: string
  coordinates: [number, number]
  capacity: number
  bedrooms: number
  bathrooms: number
  rating: number
  reviews: number
  price: number
  originalPrice: number
  images: string[]
  type: string
  verified: boolean
  premium: boolean
  registrationCode: string
  description: string
  longDescription: string
  amenities: Array<{
    name: string
    icon: string
    category: string
  }>
  platforms: Array<{
    name: string
    url: string
    price: number
    available: boolean
  }>
  rules: string[]
  nearbyAttractions: Array<{
    name: string
    distance: string
  }>
  host: {
    name: string
    avatar: string
    joinedYear: number
    reviews: number
    responseRate: number
    languages: string[]
  }
}

export const mockAccommodations: Accommodation[] = [
  {
    id: 1,
    name: "Teuleria de l'Estany",
    location: "Biosca, Lleida",
    fullAddress: "C-451, km 34-35, 25752, Biosca, Lleida",
    coordinates: [2.8214, 41.9794],
    capacity: 15,
    bedrooms: 7,
    bathrooms: 3,
    rating: 4.8,
    reviews: 127,
    price: 120,
    originalPrice: 140,
    images: [
      "/catalonia-stone-house.png",
      "/placeholder-j0noa.png",
      "/boutique-hotel-montserrat.png",
      "/catalonia-stone-house.png",
      "/placeholder-j0noa.png",
    ],
    type: "Casa Rural",
    verified: true,
    premium: true,
    registrationCode: "HUTL-00361",
    description:
      "Encantadora casa rural del segle XVIII completament restaurada, situada al cor del Baix Empordà. Envoltada de vinyes i camps d'oliveres, ofereix una experiència autèntica de la Catalunya rural amb totes les comoditats modernes.",
    longDescription:
      "Els Roures és una casa rural única que combina l'encant tradicional català amb les comoditats del segle XXI. Construïda amb pedra local i restaurada amb materials originals, la casa conserva elements arquitectònics històrics com les bigues de fusta vista i les parets de pedra. Situada en una finca de 2 hectàrees amb jardins privats, piscina i zona de barbacoa, és el lloc perfecte per desconnectar i gaudir de la natura.",
    amenities: [
      { name: "WiFi gratuït", icon: "📶", category: "Connectivitat" },
      { name: "Piscina privada", icon: "🏊", category: "Exterior" },
      { name: "Pàrquing gratuït", icon: "🚗", category: "Transport" },
      { name: "Jardí privat", icon: "🌳", category: "Exterior" },
      { name: "Barbacoa", icon: "🔥", category: "Cuina" },
      { name: "Cuina equipada", icon: "🍳", category: "Cuina" },
      { name: "Rentadora", icon: "👕", category: "Serveis" },
      { name: "Aire condicionat", icon: "❄️", category: "Clima" },
      { name: "Calefacció", icon: "🔥", category: "Clima" },
      { name: "Animals permesos", icon: "🐕", category: "Polítiques" },
    ],
    platforms: [
      { name: "Airbnb", url: "https://airbnb.com", price: 120, available: true },
      { name: "Booking.com", url: "https://booking.com", price: 125, available: true },
      { name: "Escapada Rural", url: "https://escapadarural.com", price: 120, available: false },
    ],
    rules: [
      "Check-in: 16:00 - 20:00",
      "Check-out: 11:00",
      "No fumadors",
      "Animals permesos (suplement 10€/nit)",
      "Festes no permeses",
      "Màxim 8 persones",
    ],
    nearbyAttractions: [
      { name: "Monells (centre històric)", distance: "2 km" },
      { name: "Peratallada", distance: "5 km" },
      { name: "Platja de Pals", distance: "15 km" },
      { name: "Girona", distance: "25 km" },
    ],
    host: {
      name: "Maria i Josep",
      avatar: "/placeholder.svg?key=host1",
      joinedYear: 2018,
      reviews: 127,
      responseRate: 98,
      languages: ["Català", "Castellà", "Francès"],
    },
  },
  {
    id: 2,
    name: "Apartament Sagrada Família",
    location: "Barcelona, Eixample",
    fullAddress: "Carrer de Mallorca, 401, 08013 Barcelona",
    coordinates: [2.1734, 41.4036],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.9,
    reviews: 89,
    price: 95,
    originalPrice: 95,
    images: ["/placeholder-j0noa.png", "/catalonia-stone-house.png", "/boutique-hotel-montserrat.png"],
    type: "Apartament Turístic",
    verified: true,
    premium: false,
    registrationCode: "HUTB-005678",
    description:
      "Modern apartament a 2 minuts caminant de la Sagrada Família. Completament equipat amb totes les comoditats per a una estada perfecta a Barcelona.",
    longDescription:
      "Aquest elegant apartament està situat al cor de l'Eixample, oferint fàcil accés als principals llocs d'interès de Barcelona. Amb un disseny contemporani i acabats de qualitat, l'apartament disposa de dues habitacions còmodes, una cuina totalment equipada i un saló lluminós amb balcó. La ubicació és ideal per explorar la ciutat a peu o en transport públic.",
    amenities: [
      { name: "WiFi gratuït", icon: "📶", category: "Connectivitat" },
      { name: "Aire condicionat", icon: "❄️", category: "Clima" },
      { name: "Cuina equipada", icon: "🍳", category: "Cuina" },
      { name: "Rentadora", icon: "👕", category: "Serveis" },
      { name: "Balcó", icon: "🏢", category: "Exterior" },
      { name: "Ascensor", icon: "🛗", category: "Accessibilitat" },
    ],
    platforms: [
      { name: "Airbnb", url: "https://airbnb.com", price: 95, available: true },
      { name: "Booking.com", url: "https://booking.com", price: 98, available: true },
    ],
    rules: [
      "Check-in: 15:00 - 22:00",
      "Check-out: 11:00",
      "No fumadors",
      "No festes",
      "Màxim 4 persones",
      "Respectar els veïns",
    ],
    nearbyAttractions: [
      { name: "Sagrada Família", distance: "200 m" },
      { name: "Hospital de Sant Pau", distance: "500 m" },
      { name: "Park Güell", distance: "1.5 km" },
      { name: "Casa Batlló", distance: "2 km" },
    ],
    host: {
      name: "Anna",
      avatar: "/placeholder.svg?key=host2",
      joinedYear: 2020,
      reviews: 89,
      responseRate: 95,
      languages: ["Català", "Castellà", "Anglès"],
    },
  },
  {
    id: 3,
    name: "Hotel Boutique Montserrat",
    location: "Montserrat, Barcelona",
    fullAddress: "Plaça de Montserrat, 1, 08199 Montserrat, Barcelona",
    coordinates: [1.8312, 41.5931],
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.7,
    reviews: 203,
    price: 180,
    originalPrice: 200,
    images: ["/boutique-hotel-montserrat.png", "/placeholder-j0noa.png", "/catalonia-stone-house.png"],
    type: "Hotel",
    verified: true,
    premium: true,
    registrationCode: "HB-009876",
    description:
      "Hotel boutique exclusiu amb vistes espectaculars a la muntanya de Montserrat. Perfecte per a escapades romàntiques i experiències úniques.",
    longDescription:
      "Situat en un entorn natural incomparable, aquest hotel boutique ofereix una experiència de luxe amb un toc autènticament català. Cada habitació està dissenyada amb materials naturals i ofereix vistes panoràmiques a la muntanya sagrada. L'hotel disposa d'un spa complet, restaurant gastronòmic i terrasses amb vistes espectaculars.",
    amenities: [
      { name: "WiFi gratuït", icon: "📶", category: "Connectivitat" },
      { name: "Spa", icon: "🧘", category: "Benestar" },
      { name: "Restaurant", icon: "🍽️", category: "Gastronomia" },
      { name: "Pàrquing gratuït", icon: "🚗", category: "Transport" },
      { name: "Terrassa", icon: "🌄", category: "Exterior" },
      { name: "Servei d'habitacions", icon: "🛎️", category: "Serveis" },
      { name: "Gimnàs", icon: "💪", category: "Benestar" },
      { name: "Aire condicionat", icon: "❄️", category: "Clima" },
    ],
    platforms: [
      { name: "Booking.com", url: "https://booking.com", price: 180, available: true },
      { name: "Hotels.com", url: "https://hotels.com", price: 185, available: true },
      { name: "Expedia", url: "https://expedia.com", price: 190, available: false },
    ],
    rules: [
      "Check-in: 14:00 - 24:00",
      "Check-out: 12:00",
      "No fumadors",
      "Política de cancel·lació flexible",
      "Servei de consergeria 24h",
    ],
    nearbyAttractions: [
      { name: "Monestir de Montserrat", distance: "500 m" },
      { name: "Funicular de Sant Joan", distance: "300 m" },
      { name: "Camí dels Degotalls", distance: "1 km" },
      { name: "Manresa", distance: "20 km" },
    ],
    host: {
      name: "Hotel Montserrat",
      avatar: "/placeholder.svg?key=hotel",
      joinedYear: 2015,
      reviews: 203,
      responseRate: 100,
      languages: ["Català", "Castellà", "Anglès", "Francès"],
    },
  },
  {
    id: 4,
    name: "Mas Can Felip",
    location: "Vic, Osona",
    fullAddress: "Camí de Can Felip, s/n, 08500 Vic, Barcelona",
    coordinates: [2.2569, 41.9301],
    capacity: 12,
    bedrooms: 6,
    bathrooms: 4,
    rating: 4.6,
    reviews: 45,
    price: 200,
    originalPrice: 220,
    images: ["/catalonia-stone-house.png", "/boutique-hotel-montserrat.png", "/placeholder-j0noa.png"],
    type: "Casa Rural",
    verified: true,
    premium: false,
    registrationCode: "HUTG-002468",
    description:
      "Masia catalana tradicional del segle XVII amb capacitat per a 12 persones. Ideal per a grups familiars i celebracions en un entorn natural privilegiat.",
    longDescription:
      "Can Felip és una autèntica masia catalana que ha estat en mans de la mateixa família durant generacions. Completament restaurada respectant l'arquitectura original, ofereix espais amplis i confortables per a grans grups. Envoltada de boscos i prats, disposa d'una gran finca privada amb zona de jocs per a nens, barbacoa i espais per a activitats a l'aire lliure.",
    amenities: [
      { name: "WiFi gratuït", icon: "📶", category: "Connectivitat" },
      { name: "Barbacoa", icon: "🔥", category: "Exterior" },
      { name: "Pàrquing gratuït", icon: "🚗", category: "Transport" },
      { name: "Animals permesos", icon: "🐕", category: "Polítiques" },
      { name: "Jardí gran", icon: "🌳", category: "Exterior" },
      { name: "Zona de jocs", icon: "🎮", category: "Entreteniment" },
      { name: "Llar de foc", icon: "🔥", category: "Confort" },
      { name: "Cuina gran", icon: "🍳", category: "Cuina" },
    ],
    platforms: [
      { name: "Club Rural", url: "https://clubrural.com", price: 200, available: true },
      { name: "Escapada Rural", url: "https://escapadarural.com", price: 205, available: true },
    ],
    rules: [
      "Check-in: 16:00 - 20:00",
      "Check-out: 12:00",
      "Animals permesos",
      "Festes permeses amb moderació",
      "Màxim 12 persones",
      "Respectar la natura",
    ],
    nearbyAttractions: [
      { name: "Vic (centre històric)", distance: "5 km" },
      { name: "Pantà de Sau", distance: "15 km" },
      { name: "Rupit i Pruit", distance: "25 km" },
      { name: "Montseny", distance: "30 km" },
    ],
    host: {
      name: "Família Felip",
      avatar: "/placeholder.svg?key=host3",
      joinedYear: 2019,
      reviews: 45,
      responseRate: 92,
      languages: ["Català", "Castellà"],
    },
  },
  {
    id: 5,
    name: "Apartament Port Olímpic",
    location: "Barcelona, Vila Olímpica",
    fullAddress: "Carrer de la Marina, 19-21, 08005 Barcelona",
    coordinates: [2.1969, 41.3888],
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.4,
    reviews: 156,
    price: 130,
    originalPrice: 150,
    images: ["/placeholder-j0noa.png", "/catalonia-stone-house.png", "/boutique-hotel-montserrat.png"],
    type: "Apartament Turístic",
    verified: true,
    premium: true,
    registrationCode: "HUTB-007890",
    description:
      "Apartament modern amb terrassa i vistes al mar, situat al Port Olímpic. A pocs metres de la platja i amb fàcil accés al centre de Barcelona.",
    longDescription:
      "Aquest espectacular apartament ofereix una ubicació privilegiada al Port Olímpic, amb vistes directes al mar Mediterrani. Amb un disseny contemporani i una gran terrassa privada, és perfecte per gaudir del sol i la brisa marina. L'apartament està completament equipat i ofereix fàcil accès a restaurants, bars i activitats nàutiques.",
    amenities: [
      { name: "WiFi gratuït", icon: "📶", category: "Connectivitat" },
      { name: "Terrassa", icon: "🏢", category: "Exterior" },
      { name: "Vista al mar", icon: "🌊", category: "Vistes" },
      { name: "Pàrquing", icon: "🚗", category: "Transport" },
      { name: "Aire condicionat", icon: "❄️", category: "Clima" },
      { name: "Cuina equipada", icon: "🍳", category: "Cuina" },
      { name: "Rentadora", icon: "👕", category: "Serveis" },
      { name: "Ascensor", icon: "🛗", category: "Accessibilitat" },
    ],
    platforms: [
      { name: "Airbnb", url: "https://airbnb.com", price: 130, available: true },
      { name: "HomeAway", url: "https://homeaway.com", price: 135, available: true },
      { name: "Booking.com", url: "https://booking.com", price: 140, available: true },
    ],
    rules: [
      "Check-in: 15:00 - 21:00",
      "Check-out: 11:00",
      "No fumadors",
      "No festes",
      "Màxim 6 persones",
      "Respectar els veïns",
    ],
    nearbyAttractions: [
      { name: "Platja Nova Icària", distance: "100 m" },
      { name: "Port Olímpic", distance: "200 m" },
      { name: "Parc de la Ciutadella", distance: "1 km" },
      { name: "Barri Gòtic", distance: "2.5 km" },
    ],
    host: {
      name: "Carlos",
      avatar: "/placeholder.svg?key=host4",
      joinedYear: 2017,
      reviews: 156,
      responseRate: 96,
      languages: ["Català", "Castellà", "Anglès", "Italià"],
    },
  },
]

export const getAccommodationById = (id: number): Accommodation | undefined => {
  return mockAccommodations.find((acc) => acc.id === id)
}

export const getAccommodationsByLocation = (location: string): Accommodation[] => {
  return mockAccommodations.filter((acc) => acc.location.toLowerCase().includes(location.toLowerCase()))
}

export const getAccommodationsByType = (type: string): Accommodation[] => {
  return mockAccommodations.filter((acc) => acc.type.toLowerCase().includes(type.toLowerCase()))
}
