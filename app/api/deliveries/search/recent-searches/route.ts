import { NextRequest } from "next/server";
import { proxyRecentSearchMutation, proxySearchRequest } from "@/services/deliveries/search";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) { return proxySearchRequest(request, "recent-searches"); }
export function POST(request: NextRequest) { return proxyRecentSearchMutation(request, "POST"); }
export function DELETE(request: NextRequest) { return proxyRecentSearchMutation(request, "DELETE"); }
