import { NextRequest, NextResponse } from "next/server";
import { callAuthenticatedMultipart, requireSession } from "@/services/api/server";
import { rejectCrossSiteRequest } from "@/services/api/request-security";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;
  if (Number(request.headers.get("content-length") ?? 0) > 10 * 1024 * 1024 + 64 * 1024) {
    return NextResponse.json({ message: "Choose a photo under 10 MB." }, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/heic", "image/heif"].includes(file.type)) {
    return NextResponse.json({ message: "Choose a JPEG, PNG, or HEIC photo under 10 MB." }, { status: 400 });
  }
  const body = new FormData();
  body.set("file", file, file.name);
  return callAuthenticatedMultipart(`/apps/deliveries/chat/order/${encodeURIComponent((await params).id)}/customer_rider/upload`, body, request, "POST");
}
