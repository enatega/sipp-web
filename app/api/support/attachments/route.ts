import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/services/auth/session";
import { matchesDeclaredType, sniffFileType } from "@/services/api/file-signature";
import { clientIpHeaders, requireSession } from "@/services/api/server";

export async function POST(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;
  const token = request.cookies.get(authCookieNames.token)?.value;
  if (!token) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const limit = file instanceof File && ["image/webp", "application/pdf"].includes(file.type) ? 5 : 10;
    if (!(file instanceof File) || file.size > limit * 1024 * 1024 || !["image/png", "image/jpeg", "image/heic", "image/heif", "image/webp", "application/pdf"].includes(file.type)) return NextResponse.json({ message: `Choose a supported attachment under ${limit} MB.` }, { status: 400 });
    // The declared type comes from the browser; the file's own bytes must agree with it.
    const sniffed = await sniffFileType(file);
    if (!sniffed || !matchesDeclaredType(file.type, sniffed)) return NextResponse.json({ message: `Choose a supported attachment under ${limit} MB.` }, { status: 400 });
    const body = new FormData();
    body.set("file", file);
    const base = (process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${base}/deliveries/support-tickets/attachments`, { method: "POST", body, headers: { ...(await clientIpHeaders()), Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(25000) });
    const data: unknown = await upstream.json().catch(() => null);
    if (!upstream.ok) return NextResponse.json({ message: "Attachment upload failed." }, { status: upstream.status });
    if (!data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") throw new Error("Invalid upload response");
    return NextResponse.json({ url: data.url });
  } catch { return NextResponse.json({ message: "Attachment upload failed." }, { status: 503 }); }
}
