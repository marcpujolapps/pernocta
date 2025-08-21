/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

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
    const systemPrompt = `You are a data enrichment agent for a travel accommodation aggregator for Catalonia, Spain.\nReturn concise, factual JSON. Use only information you are reasonably confident about. If unknown, set the field to null. Avoid hallucinations. Infer services only if clearly supported. Answer always in Catalan.`;

    const schema = z.object({
      long_description: z.string().nullable(),
      short_description: z.string().nullable(),
      services: z.array(z.string()).nullable(),
      amenities: z.array(z.string()).nullable(),
      price_range_eur: z.string().nullable(),
      website: z.string().url().nullable().or(z.literal("")).nullable(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable(),
      booking_links: z
        .array(z.object({ platform: z.string(), url: z.string().url() }))
        .nullable(),
      reviews_out_of_5: z.number().min(0).max(5).nullable(),
      reviews_summary: z.string().nullable(),
    });

    const userPrompt = `Known data:\n${baseContext}\n\nReturn ONLY a JSON object with keys: ${Object.keys(
      schema.shape
    ).join(", ")}.`;

    // const { object } = await generateObject({
    //   model: "openai/gpt-5-mini",
    //   system: systemPrompt,
    //   prompt: userPrompt,
    //   maxOutputTokens: 800,
    //   schema,
    // });

    // console.log(object);

    // const validated = schema.safeParse(object);
    // if (!validated.success) {
    //   return new Response(
    //     JSON.stringify({
    //       error: "Schema validation failed",
    //       issues: validated.error.issues,
    //       raw: object,
    //     }),
    //     { status: 422 }
    //   );
    // }

    console.log("gemini-2.5-flash-lite");

    const { text, sources, providerMetadata, usage } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      system: systemPrompt,
      tools: {
        google_search: google.tools.googleSearch({}) as any,
      },
      prompt: userPrompt,
    });

    return new Response(
      JSON.stringify({ enrichment: text, sources, providerMetadata, usage }),
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
