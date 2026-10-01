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
    amount <= 0 ||
    amount > 999_999.99 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 ||
    typeof paymentMethodId !== "string" ||
    !PAYMENT_METHOD_ID.test(paymentMethodId)
  ) {
    return NextResponse.json({ message: "Enter a valid amount and choose a saved card." }, { status: 400 });
  }

  const activeCurrencyResponse = await callApi("/apps/deliveries/currency", { request });
  if (!activeCurrencyResponse.ok) return activeCurrencyResponse;
  const activeCurrency: unknown = await activeCurrencyResponse.json();
  const currencyCode = activeCurrency && typeof activeCurrency === "object" && "code" in activeCurrency
    ? activeCurrency.code
    : null;
  if (typeof currencyCode !== "string" || !/^[A-Za-z]{3}$/.test(currencyCode)) {
    return NextResponse.json({ message: "Active currency configuration is unavailable." }, { status: 503 });
  }
  if (currencyCode.toUpperCase() === "CRC" && amount < 500) {
    return NextResponse.json({ message: "Amount is below the minimum wallet top-up." }, { status: 400 });
  }
  if (currencyCode.toUpperCase() === "JPY" && !Number.isInteger(amount)) {
    return NextResponse.json({ message: "Enter a whole amount for this currency." }, { status: 400 });
  }

  return callApi("/apps/deliveries/wallet/topup", {
    method: "POST",
    request,
    body: { amount, currency: currencyCode.toUpperCase(), paymentMethodId },
  });
}
