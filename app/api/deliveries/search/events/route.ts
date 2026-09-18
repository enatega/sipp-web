import { NextRequest } from "next/server";
import { proxySearchEvent } from "@/services/deliveries/search";
export const dynamic = "force-dynamic";
export function POST(request: NextRequest) { return proxySearchEvent(request); }
