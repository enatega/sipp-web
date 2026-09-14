import { callPublicApi } from "@/services/api/server";

export async function POST(request: Request) {
  const body = await request.json();
  return callPublicApi("/auth/shared/signup/send-otp", {
    ...body,
    otp_type: "sms",
  });
}
