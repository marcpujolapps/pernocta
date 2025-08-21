// Accommodation type mappings for UI and Firestore queries
import { Trees, Home, Hotel, Tent, LucideIcon } from "lucide-react"

export interface AccommodationType {
  id: string
  name: string
  icon: LucideIcon
  firestoreValues: string[]
}

// Mapping between UI type IDs and their corresponding Firestore query values
export const ACCOMMODATION_TYPES: AccommodationType[] = [
  {
    id: "casa-rural",
    name: "Cases rurals",
    icon: Trees,
    firestoreValues: ["Cases Rurals", "Casa Rural"] // Cover both plural and singular forms
  },
  {
    id: "apartament",
    name: "Apartaments",
    icon: Home,
    firestoreValues: ["Habitatges d'ús turístic", "Llars compartides", "Apartament Turístic"] // Multiple Firestore categories
  },
  {
    id: "hotel",
    name: "Hotels",
    icon: Hotel,
    firestoreValues: ["Hotel", "Hotels"] // Cover both singular and plural
  },
  {
    id: "camping",
    name: "Càmpings",
    icon: Tent,
    firestoreValues: ["Càmping", "Càmpings"] // Cover both singular and plural
  }
]

// Helper function to get Firestore values for given UI type IDs
export function getFirestoreValuesForTypes(typeIds: string[]): string[] {
  const firestoreValues: string[] = []
  
  typeIds.forEach(typeId => {
    const accommodationType = ACCOMMODATION_TYPES.find(type => type.id === typeId)
    if (accommodationType) {
      firestoreValues.push(...accommodationType.firestoreValues)
    }
  })
  
  return firestoreValues
}

// Helper function to get accommodation type by ID
export function getAccommodationTypeById(id: string): AccommodationType | undefined {
  return ACCOMMODATION_TYPES.find(type => type.id === id)
}

// Helper function to get all type IDs
export function getAllTypeIds(): string[] {
  return ACCOMMODATION_TYPES.map(type => type.id)
}

// Helper function to get icon for a given accommodation type string
export function getIconForType(typeString: string): LucideIcon {
  const normalizedType = typeString?.toLowerCase() || ""
  
  // Check each accommodation type's Firestore values
  for (const accommodationType of ACCOMMODATION_TYPES) {
    const matchesFirestoreValue = accommodationType.firestoreValues.some(value => 
      normalizedType.includes(value.toLowerCase())
    )
    
    if (matchesFirestoreValue) {
      return accommodationType.icon
    }
    
    // Also check if the normalized type contains the accommodation type ID
    if (normalizedType.includes(accommodationType.id.replace("-", " ")) || 
        normalizedType.includes(accommodationType.id)) {
      return accommodationType.icon
    }
  }
  
  // Default to Home icon if no match found
  return Home
}
