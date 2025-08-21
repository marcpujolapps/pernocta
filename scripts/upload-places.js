/* eslint-disable */
// CommonJS version to allow running with plain `node` without ESM config.
const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("../node/k.json");

// Mapping from original Catalan keys to normalized English snake_case keys.
const KEY_MAP = {
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
};

function cleanValue(val) {
  // Normalize "empty" style values to explicit null (instead of undefined)
  if (val === null) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      trimmed === "" ||
      trimmed === "No aplica" ||
      trimmed === "Sense categoritzar"
    )
      return null;
    return trimmed;
  }
  if (val === "" || val === undefined) return null;
  return val;
}

function slugify(...parts) {
  return parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transformPlace(raw) {
  const out = {};
  for (const [origKey, value] of Object.entries(raw || {})) {
    const mapped = KEY_MAP[origKey];
    if (!mapped) continue;
    out[mapped] = cleanValue(value);
  }
  // numeric coercion
  [
    "control_digit",
    "number",
    "total_places",
    "total_rooms",
    "county_code",
    "municipality_code",
  ].forEach((k) => {
    if (out[k] !== undefined && out[k] !== null && out[k] !== "") {
      const n = Number(out[k]);
      if (!isNaN(n)) out[k] = n;
    }
  });
  out.address = [out.street_type, out.street_name, out.number]
    .filter(Boolean)
    .join(" ");
  out.slug = slugify(out.name, out.municipality, out.licence_id);
  return out;
}

function initAdmin(serviceAccount) {
  if (getApps().length) return; // Reuse if already initialized
  initializeApp({ credential: cert(serviceAccount) });
}

async function main() {
  initAdmin(serviceAccount);
  const db = getFirestore();

  const placesPath = path.join(process.cwd(), "public", "places.json");
  if (!fs.existsSync(placesPath)) {
    console.error("places.json not found at public/places.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(placesPath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse places.json", e);
    process.exit(1);
  }
  if (!Array.isArray(data)) {
    console.error("Expected places.json root to be an array");
    process.exit(1);
  }

  console.log(`Uploading ${data.length} documents...`);

  const BATCH_SIZE = 500;
  const RATE_LIMIT_DELAY = 100; // 100ms delay between batches to stay under 10k requests/second
  
  // Process data in batches of 500
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const currentBatch = data.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)} (${currentBatch.length} documents)`);
    
    currentBatch.forEach((rawPlace, batchIdx) => {
      const normalized = transformPlace(rawPlace);
      const colRef = db.collection("places");
      const stableId = normalized.licence_id;
      const docRef = stableId ? colRef.doc(String(stableId)) : colRef.doc();
      
      batch.set(
        docRef,
        {
          ...normalized,
          createdAt: Timestamp.now(),
        },
        { merge: true }
      );
      
      const globalIdx = i + batchIdx;
      console.log(
        `Queued ${globalIdx + 1}/${data.length} -> ${normalized.name || "Unnamed"} (${
          stableId || docRef.id
        })`
      );
    });

    try {
      await batch.commit();
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} committed successfully`);
      
      // Rate limiting: wait between batches to avoid hitting 10k requests/second limit
      if (i + BATCH_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Error committing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
      throw error;
    }
  }

  console.log("Upload complete. All documents have been uploaded to Firestore.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
