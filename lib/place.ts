// Shared types and mapping for "places" dataset (normalized accommodation registry records)
// Keys are normalized to English snake_case.

export interface Place {
  type: string | null
  licence_id: string | null
  control_digit: number | null
  name: string | null
  status: string | null
  street_type: string | null
  street_name: string | null
  number: number | null
  floor: string | null
  door: string | null
  staircase: string | null
  block: string | null
  postal_code: string | null
  municipality: string | null
  municipality_code: number | null
  county: string | null
  county_code: number | null
  province: string | null
  cadastral_ref: string | null
  occupancy_certificate: string | null
  group: string | null
  modality: string | null
  category: string | null
  accommodation_unit: string | null
  total_places: number | null
  total_rooms: number | null
  territorial_unit: string | null
  tourist_brand: string | null
  tax_id: string | null
  holder_company_name: string | null
  holder_name: string | null
  holder_surname1: string | null
  holder_surname2: string | null
  // Derived / supplemental fields
  address: string | null
  slug: string
  coordinates?: [number, number] // For map display
  geocode_error?: boolean;
  createdAt?: unknown // Firestore Timestamp when stored in DB
}

// Mapping from original Catalan dataset keys to normalized keys.
// Exported for reuse in ingestion or transformation utilities.
export const CATALAN_TO_ENGLISH_KEY_MAP: Record<string, keyof Place> = {
  "Tipus establiment": "type",
  "Número inscripció": "licence_id",
  "Dígit de control": "control_digit",
  Rètol: "name",
  Estat: "status",
  "Tipus de via": "street_type",
  "Nom de la via": "street_name",
  Número: "number",
  Pis: "floor",
  Porta: "door",
  Escala: "staircase",
  Bloc: "block",
  "Codi Postal": "postal_code",
  Municipi: "municipality",
  "Codi Municipi (IDESCAT)": "municipality_code",
  Comarca: "county",
  "Codi Comarca (IDESCAT)": "county_code",
  Província: "province",
  "Referència cadastral": "cadastral_ref",
  "Cèdula d'habitabilitat": "occupancy_certificate",
  Grup: "group",
  Modalitat: "modality",
  Categoria: "category",
  "Unitat d'allotjament": "accommodation_unit",
  "Total places": "total_places",
  "Total estances": "total_rooms",
  SSTT: "territorial_unit",
  "Marca turística": "tourist_brand",
  CIF: "tax_id",
  "Raó Social del titular": "holder_company_name",
  "Nom del titular": "holder_name",
  "Primer cognom": "holder_surname1",
  "Segon cognom": "holder_surname2",
}

export const PLACE_NUMERIC_FIELDS: Array<keyof Place> = [
  "control_digit",
  "number",
  "total_places",
  "total_rooms",
  "county_code",
  "municipality_code",
]
