import { NextRequest } from "next/server";
import { proxySearchRequest } from "@/services/deliveries/search";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) { return proxySearchRequest(request, "recommendations"); }
