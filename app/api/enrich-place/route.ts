/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { z } from "zod";
import { embed, generateText } from "ai";
// import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

const requestSchema = z.object({
  model: z.string().optional(),
  placeId: z.string(),
  place: z.object({
    name: z.string().nullable(),
    municipality: z.string().nullable(),
    county: z.string().nullable(),
    province: z.string().nullable(),
    licence_id: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    modality: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
  }),
  forceRefresh: z.boolean().optional().default(false),
});

export const runtime = "edge";
export const dynamic = "force-dynamic";

function extractJSONFromMarkdown(text: string): any {
  // Remove markdown code block formatting
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  // Fallback: try to parse the entire text as JSON
  return JSON.parse(text);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { place } = requestSchema.parse(json);

    const parts: string[] = [];
    parts.push("We have a tourist accommodation in Catalonia (Spain).");
    if (place.name) parts.push(`Name: ${place.name}`);
    if (place.address) parts.push(`Address: ${place.address}`);
    const loc = [place.municipality, place.county, place.province]
      .filter(Boolean)
      .join(", ");
    if (loc) parts.push(`Location: ${loc}`);
    if (place.licence_id)
      parts.push(`Official licence id: ${place.licence_id}`);

    const baseContext = parts.join("\n");
    const systemPrompt = `You are a data enrichment agent for a travel accommodation aggregator for Catalonia, Spain.\nReturn concise, factual JSON. Use only information you are reasonably confident about. If unknown, set the field to null. Avoid hallucinations. Infer services only if clearly supported. Answer always in Catalan. Check booking platforms like Airbnb, Booking, and others.`;

    const schema = z.object({
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

    console.log(userPrompt);

    // const { object } = await generateObject({
    //   model: "openai/gpt-5-mini",
    //   system: systemPrompt,
    //   prompt: userPrompt,
    //   maxOutputTokens: 800,
    //   schema,
    // });

    // console.log(object);

    const { text, sources, providerMetadata, usage } = await generateText({
      // model: google("gemini-2.5-flash-lite"),
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      // tools: {
      //   google_search: google.tools.googleSearch({}) as any,
      // },
      tools: {
        web_search_preview: openai.tools.webSearchPreview({}),
      },
      prompt: userPrompt,
    });

    console.log(text);

    let parsedData: any;
    try {
      parsedData = extractJSONFromMarkdown(text);
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: "JSON parsing failed",
          detail:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          raw: text,
        }),
        { status: 422 }
      );
    }

    const validated = schema.safeParse(parsedData);
    if (!validated.success) {
      return new Response(
        JSON.stringify({
          error: "Schema validation failed",
          issues: validated.error.issues,
          raw: text,
        }),
        { status: 422 }
      );
    }

    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-large"),
      value: "sunny day at the beach",
      providerOptions: {
        openai: {
          dimensions: 2048,
        },
      },
    });

    // Save enrichment data to Firestore
    return new Response(
      JSON.stringify({
        enrichment: validated.data,
        embedding,
        sources,
        providerMetadata,
        usage,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(err);

    return new Response(JSON.stringify({ error: "Unhandled error", detail }), {
      status: 500,
    });
  }
}
