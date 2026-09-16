import "server-only";

import { NextResponse } from "next/server";

const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

type ContactRequestBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactRequestBody | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const subject = body?.subject?.trim();
  const message = body?.message?.trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Please provide a valid email address." }, { status: 400 });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return NextResponse.json(
      { message: "The contact form is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        ...(privateKey ? { accessToken: privateKey } : {}),
        template_params: {
          from_name: name,
          from_email: email,
          subject,
          message,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");
      return NextResponse.json(
        { message: errorText || "We could not send your message. Please try again." },
        { status: upstream.status },
      );
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      { message: "The contact service is unavailable right now." },
      { status: 503 },
    );
  }
}
