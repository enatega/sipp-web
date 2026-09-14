import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Renders the map preview for the location picker.
 *
 * The Static Maps request is made here, server-side, so GOOGLE_MAPS_API_KEY
 * stays out of the browser — a key shipped in a NEXT_PUBLIC_ variable would
 * be readable by anyone viewing the page. Returns 404 when no key is
 * configured; the picker falls back to its illustration.
 */
export async function GET(request: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { message: "Map previews are not configured." },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const zoom = Math.min(20, Math.max(1, Number(searchParams.get("zoom")) || 15));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { message: "Valid lat and lng are required." },
      { status: 400 },
    );
  }

  // No marker param: the picker overlays its own centred pin, so a second
  // Google-drawn marker would double up.
  const upstream = new URL("https://maps.googleapis.com/maps/api/staticmap");
  upstream.searchParams.set("center", `${lat},${lng}`);
  upstream.searchParams.set("zoom", String(zoom));
  upstream.searchParams.set("size", "640x320");
  upstream.searchParams.set("scale", "2");
  upstream.searchParams.set("key", key);

  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Map preview unavailable." },
        { status: response.status },
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "image/png",
        // Coordinates repeat as the visitor pans the list; a short private
        // cache avoids re-billing identical tiles.
        "Cache-Control": "private, max-age=600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Map preview unavailable." },
      { status: 503 },
    );
  }
}
