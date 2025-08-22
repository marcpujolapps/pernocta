/* eslint-disable */
// CommonJS version to allow running with plain `node` without ESM config.
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { embed, generateText } = require("ai");
const { openai } = require("@ai-sdk/openai");
const { z } = require("zod");
const serviceAccount = require("../node/k.json");

// Schema for validation (matching the API route)
const enrichmentSchema = z.object({
  long_description: z.string().nullable(),
  short_description: z.string().nullable(),
  services: z.array(z.string()).nullable(),
  price_range_eur: z.string().nullable(),
  website: z.string().nullable().or(z.literal("")).nullable(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable(),
  booking_links: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .nullable(),
  reviews_out_of_5: z.number().min(0).max(5).nullable(),
  reviews_summary: z.string().nullable(),
});

function extractJSONFromMarkdown(text) {
  // Remove markdown code block formatting
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  // Fallback: try to parse the entire text as JSON
  return JSON.parse(text);
}

async function enrichPlace(place) {
  const parts = [];
  parts.push("We have a tourist accommodation in Catalonia (Spain).");
  if (place.name) parts.push(`Name: ${place.name}`);
  if (place.address) parts.push(`Address: ${place.address}`);
  const loc = [place.municipality, place.county, place.province]
    .filter(Boolean)
    .join(", ");
  if (loc) parts.push(`Location: ${loc}`);
  if (place.licence_id) parts.push(`Official licence id: ${place.licence_id}`);

  const baseContext = parts.join("\n");
  const systemPrompt = `You are a data enrichment agent for a travel accommodation aggregator for Catalonia, Spain.\nReturn concise, factual JSON. Use only information you are reasonably confident about. If unknown, set the field to null. Avoid hallucinations. Infer services only if clearly supported. Answer always in Catalan. Check booking platforms like Airbnb, Booking, and others.`;

  const userPrompt = `Known data:\n${baseContext}\n\nReturn ONLY a JSON object with this exact structure:
{
  "long_description": "string or null - detailed description in Catalan, as much information as possible but do not hallucinate or invent",
  "short_description": "string or null - brief description in Catalan", 
  "services": "array of strings or null - services offered",
  "price_range_eur": "string or null - price range in euros",
  "website": "string (valid URL) or null - official website",
  "email": "string (valid email) or null - contact email",
  "phone": "string or null - contact phone number",
  "booking_links": "array of objects {platform: string, url: string} or null - all booking platforms available (make sure url points to the correct accommodation!)",
  "reviews_out_of_5": "number (0-5) or null - average rating",
  "reviews_summary": "string or null - summary of reviews in Catalan"
}`;

  console.log(`Enriching: ${place.name || place.licence_id}`);

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({}),
      },
      prompt: userPrompt,
    });

    let parsedData;
    try {
      parsedData = extractJSONFromMarkdown(text);
    } catch (parseError) {
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }

    const validated = enrichmentSchema.safeParse(parsedData);
    if (!validated.success) {
      throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.issues)}`);
    }

    // Create embedding for the enriched content
    const embeddingText = [
      validated.data.long_description,
      validated.data.short_description,
      place.name,
      place.municipality,
      validated.data.services?.join(" "),
    ].filter(Boolean).join(" ");

    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-large"),
      value: embeddingText,
      providerOptions: {
        openai: {
          dimensions: 2048,
        },
      },
    });

    return {
      enrichment: validated.data,
      embedding,
    };
  } catch (error) {
    console.error(`Enrichment failed for ${place.name || place.licence_id}:`, error.message);
    throw error;
  }
}

function initAdmin(serviceAccount) {
  if (getApps().length) return; // Reuse if already initialized
  initializeApp({ credential: cert(serviceAccount) });
}

async function main() {
  const municipalityCode = process.argv[2];
  
  if (!municipalityCode) {
    console.error("Usage: node enrich-places-by-municipality.js <municipality_code>");
    console.error("Example: node enrich-places-by-municipality.js 081815");
    process.exit(1);
  }

  console.log(`Enriching places for municipality code: ${municipalityCode}`);

  initAdmin(serviceAccount);
  const db = getFirestore();

  try {
    // Fetch all places for the given municipality code
    const placesQuery = await db
      .collection("places")
      .where("municipality_code", "==", Number(municipalityCode))
      .get();

    if (placesQuery.empty) {
      console.log(`No places found for municipality code: ${municipalityCode}`);
      return;
    }

    const places = placesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${places.length} places to enrich`);

    // Filter out places that are already enriched (unless we want to force refresh)
    const placesToEnrich = places.filter(place => 
      !place.enriched_at && !place.enrichment_error
    );

    console.log(`${placesToEnrich.length} places need enrichment (${places.length - placesToEnrich.length} already processed)`);

    if (placesToEnrich.length === 0) {
      console.log("All places in this municipality are already enriched!");
      return;
    }

    const BATCH_SIZE = 10; // Smaller batch size for AI API calls
    const RATE_LIMIT_DELAY = 2000; // 2 seconds between batches to respect AI API limits

    let successCount = 0;
    let errorCount = 0;

    // Process places in batches
    for (let i = 0; i < placesToEnrich.length; i += BATCH_SIZE) {
      const batch = placesToEnrich.slice(i, i + BATCH_SIZE);
      
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(placesToEnrich.length / BATCH_SIZE)} (${batch.length} places)`);
      
      // Process each place in the current batch
      for (let j = 0; j < batch.length; j++) {
        const place = batch[j];
        const globalIdx = i + j + 1;
        
        try {
          console.log(`\n[${globalIdx}/${placesToEnrich.length}] Processing: ${place.name || place.licence_id}`);
          
          const enrichmentResult = await enrichPlace(place);
          
          // Save to Firestore
          const enrichmentUpdate = {
            ...enrichmentResult.enrichment,
            enriched_at: Timestamp.now(),
            enrichment_error: false,
            embedding: enrichmentResult.embedding,
          };

          await db.collection("places").doc(place.id).update(enrichmentUpdate);
          
          successCount++;
          console.log(`✅ Successfully enriched and saved: ${place.name || place.licence_id}`);
          
          // Small delay between individual place enrichments
          if (j < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to enrich ${place.name || place.licence_id}:`, error.message);
          
          // Mark as error in Firestore
          try {
            await db.collection("places").doc(place.id).update({
              enrichment_error: true,
              enriched_at: Timestamp.now(),
            });
            console.log(`   Marked as error in database`);
          } catch (updateError) {
            console.error(`   Failed to update error flag:`, updateError.message);
          }
        }
      }

      // Rate limiting: wait between batches
      if (i + BATCH_SIZE < placesToEnrich.length) {
        console.log(`\n⏳ Waiting ${RATE_LIMIT_DELAY}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }

    console.log(`\n🎉 Enrichment complete!`);
    console.log(`✅ Successfully enriched: ${successCount} places`);
    console.log(`❌ Failed: ${errorCount} places`);
    console.log(`📍 Municipality code: ${municipalityCode}`);

  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
