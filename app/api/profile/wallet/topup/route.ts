import { NextRequest, NextResponse } from "next/server";
import { callApi, requireSession } from "@/services/api/server";
import { readJsonObject, rejectCrossSiteRequest } from "@/services/api/request-security";

const PAYMENT_METHOD_ID = /^pm_[A-Za-z0-9_]+$/;

export async function POST(request: NextRequest) {
  const rejected = rejectCrossSiteRequest(request) ?? requireSession(request);
  if (rejected) return rejected;

  const body = await readJsonObject(request);
  const amount = body?.amount;
  const paymentMethodId = body?.paymentMethodId;
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 500 ||
    amount > 999_999.99 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 ||
    typeof paymentMethodId !== "string" ||
    !PAYMENT_METHOD_ID.test(paymentMethodId)
  ) {
    return NextResponse.json({ message: "Enter a valid amount of at least ₡500 and choose a saved card." }, { status: 400 });
  }

  return callApi("/apps/deliveries/wallet/topup", {
    method: "POST",
    request,
    body: { amount, currency: "CRC", paymentMethodId },
  });
}
