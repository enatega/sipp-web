import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";

const PAYMENT_METHOD_ID = /^pm_[A-Za-z0-9_]+$/;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ paymentMethodId: string }> },
) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { paymentMethodId } = await context.params;
  if (!PAYMENT_METHOD_ID.test(paymentMethodId)) {
    return NextResponse.json(
      { message: "That payment method is invalid." },
      { status: 400 },
    );
  }

  return callApi(
    `/apps/deliveries/wallet/saved-cards/${encodeURIComponent(paymentMethodId)}/default`,
    { method: "PATCH", request, body: {} },
  );
}
