import { NextRequest } from "next/server";
import gis from "async-g-i-s";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    console.log("Image search query:", query);

    if (!query) {
      return new Response("Missing image URL", { status: 400 });
    }

    const res = await gis(query);

    return new Response(JSON.stringify(res), {
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
