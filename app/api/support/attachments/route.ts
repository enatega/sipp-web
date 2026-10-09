import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/services/auth/session";
import { clientIpHeaders, requireSession } from "@/services/api/server";

export async function POST(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get("file");
    const limit = file instanceof File && ["image/webp", "application/pdf"].includes(file.type) ? 5 : 10;
    if (!(file instanceof File) || file.size > limit * 1024 * 1024 || !["image/png", "image/jpeg", "image/heic", "image/heif", "image/webp", "application/pdf"].includes(file.type)) return NextResponse.json({ message: `Choose a supported attachment under ${limit} MB.` }, { status: 400 });
    const body = new FormData();
    body.set("file", file);
    const base = (process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${base}/deliveries/support-tickets/attachments`, { method: "POST", body, headers: { ...(await clientIpHeaders()), Authorization: `Bearer ${request.cookies.get(authCookieNames.token)!.value}` }, signal: AbortSignal.timeout(25000) });
    const data: unknown = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ message: "Attachment upload failed." }, { status: upstream.status });
    if (!data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") throw new Error("Invalid upload response");
    return NextResponse.json({ url: data.url });
  } catch { return NextResponse.json({ message: "Attachment upload failed." }, { status: 503 }); }
}
