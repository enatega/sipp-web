import "server-only";

import { callPublicApi } from "@/services/api/server";

type ContactRequestBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactRequestBody | null;
  if (!body) return Response.json({ message: "All fields are required." }, { status: 400 });
  const required = [body.name, body.email, body.subject, body.message];
  if (required.some((value) => !value?.trim())) {
    return Response.json({ message: "All fields are required." }, { status: 400 });
  }

  return callPublicApi("/users/form/contact-us", {
    subject: body.subject!.trim(),
    name: body.name!.trim(),
    email: body.email!.trim(),
    message: body.message!.trim(),
  });
}
