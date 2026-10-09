import "server-only";

import { isValidEmail, readJsonObject } from "@/services/api/request-security";
import { callPublicApi } from "@/services/api/server";

// Same maximums as modules/contact/schema.ts, enforced again at the boundary.
const MAX_LENGTH = { name: 80, subject: 150, message: 4000 } as const;

function trimmed(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const name = trimmed(body?.name);
  const email = trimmed(body?.email);
  const subject = trimmed(body?.subject);
  const message = trimmed(body?.message);

  if (!name || !email || !subject || !message) {
    return Response.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (name.length > MAX_LENGTH.name || subject.length > MAX_LENGTH.subject || message.length > MAX_LENGTH.message) {
    return Response.json({ message: "One or more fields are too long." }, { status: 400 });
  }

  return callPublicApi("/users/form/contact-us", { subject, name, email, message });
}
