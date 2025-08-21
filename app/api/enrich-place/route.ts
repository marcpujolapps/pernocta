import { NextRequest } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";

const requestSchema = z.object({
  model: z.string().optional(),
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
    const systemPrompt = `You are a data enrichment agent for a travel accommodation aggregator for Catalonia, Spain.\nReturn concise, factual JSON. Use only information you are reasonably confident about. If unknown, set the field to null. Avoid hallucinations. Infer services only if clearly supported.`;

    const schema = z.object({
      description: z.string().nullable(),
      short_description: z.string().nullable(),
      services: z.array(z.string()).nullable(),
      amenities: z.array(z.string()).nullable(),
      price_range_eur: z.string().nullable(),
      website: z.string().url().nullable().or(z.literal("")).nullable(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable(),
      images: z.array(z.string().url()).max(10).nullable(),
      booking_links: z
        .array(z.object({ platform: z.string(), url: z.string().url() }))
        .nullable(),
      sources: z.array(z.string().url()).nullable(),
    });

    const userPrompt = `Known data:\n${baseContext}\n\nReturn ONLY a JSON object with keys: ${Object.keys(
      schema.shape
    ).join(", ")}.`;

    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 800,
      schema,
    });

    console.log(object);

    const validated = schema.safeParse(object);
    if (!validated.success) {
      return new Response(
        JSON.stringify({
          error: "Schema validation failed",
          issues: validated.error.issues,
          raw: object,
        }),
        { status: 422 }
      );
    }

    return new Response(JSON.stringify({ enrichment: validated.data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(err);
    return new Response(JSON.stringify({ error: "Unhandled error", detail }), {
      status: 500,
    });
  }
}
