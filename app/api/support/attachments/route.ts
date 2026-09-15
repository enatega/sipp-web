import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/services/auth/session";
import { requireSession } from "@/services/api/server";

export async function POST(request: NextRequest) {
  const denied = requireSession(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) return NextResponse.json({ message: "Invalid attachment." }, { status: 400 });
    const body = new FormData();
    body.set("file", file);
    const base = (process.env.SHAANIEOL_API_BASE_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${base}/deliveries/support-tickets/attachments`, { method: "POST", body, headers: { Authorization: `Bearer ${request.cookies.get(authCookieNames.token)!.value}` }, signal: AbortSignal.timeout(25000) });
    const data: unknown = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ message: "Attachment upload failed." }, { status: upstream.status });
    if (!data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") throw new Error("Invalid upload response");
    return NextResponse.json({ url: data.url });
  } catch { return NextResponse.json({ message: "Attachment upload failed." }, { status: 503 }); }
}
