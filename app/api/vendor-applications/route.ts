import { NextRequest, NextResponse } from "next/server";
import { callPublicMultipart } from "@/services/api/server";

const TEXT_FIELDS = ["name", "email", "phone", "password", "city", "zone_id"];
const FILE_FIELDS = [
  "vendorImage",
  "business_liscence_front_file",
  "business_liscence_back_file",
  "national_id_front_file",
  "national_id_back_file",
] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();
    const outgoing = new FormData();

    for (const field of TEXT_FIELDS) {
      const value = incoming.get(field);
      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { message: "Complete all required application fields." },
          { status: 400 },
        );
      }
      outgoing.set(field, field === "password" ? value : value.trim());
    }

    for (const field of FILE_FIELDS) {
      const value = incoming.get(field);
      if (!(value instanceof File) || value.size === 0) {
        return NextResponse.json(
          { message: "Logo and all verification documents are required." },
          { status: 400 },
        );
      }
      if (value.size > MAX_FILE_SIZE || !ACCEPTED_TYPES.has(value.type)) {
        return NextResponse.json(
          { message: "Each document must be a JPG, PNG, or WebP image under 5 MB." },
          { status: 400 },
        );
      }
      outgoing.set(field, value, value.name);
    }

    const logo = incoming.get("vendorImage") as File;
    outgoing.set("business_trademark_file", logo, logo.name);
    return callPublicMultipart(
      "/apps/deliveries/vendor-applications",
      outgoing,
    );
  } catch {
    return NextResponse.json(
      { message: "We could not read the application. Please try again." },
      { status: 400 },
    );
  }
}
