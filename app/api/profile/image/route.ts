import { NextRequest, NextResponse } from "next/server";
import {
  callAuthenticatedMultipart,
  requireSession,
} from "@/services/api/server";
import {
  applySessionUser,
  authCookieNames,
  decodeSessionUser,
} from "@/services/auth/session";
import type { ProfileImageUpdatePayload } from "@/modules/account/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function detectedImageType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  if (isJpeg) return "image/jpeg";
  if (isPng) return "image/png";
  if (isWebp) return "image/webp";
  return null;
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { message: "Choose a profile photo under 5 MB." },
      { status: 413 },
    );
  }

  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { message: "Choose a profile photo to upload." },
        { status: 400 },
      );
    }
    const actualType = await detectedImageType(image);
    if (
      image.size > MAX_FILE_SIZE ||
      !ACCEPTED_TYPES.has(image.type) ||
      actualType !== image.type
    ) {
      return NextResponse.json(
        { message: "Choose a valid JPG, PNG, or WebP image under 5 MB." },
        { status: 400 },
      );
    }

    const outgoing = new FormData();
    outgoing.set("image", image, image.name);
    const response = await callAuthenticatedMultipart(
      "/apps/deliveries/profile/image",
      outgoing,
      request,
    );
    if (!response.ok) return response;

    const payload = (await response.clone().json().catch(() => null)) as
      | ProfileImageUpdatePayload
      | null;
    const imageUrl = payload?.data?.image_url?.trim();
    const sessionUser = decodeSessionUser(
      request.cookies.get(authCookieNames.user)?.value,
    );

    if (sessionUser && imageUrl) {
      applySessionUser(response, { ...sessionUser, profile: imageUrl });
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "We could not read that image. Please choose another file." },
      { status: 400 },
    );
  }
}
