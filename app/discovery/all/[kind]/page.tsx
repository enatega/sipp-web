import { notFound } from "next/navigation";
import { DiscoverySeeAllPage, type DiscoverySeeAllKind } from "@/modules/deliveries/components/discovery/DiscoverySeeAllPage";

const KINDS = new Set<DiscoverySeeAllKind>(["nearby", "deals", "shop-types", "top-brands", "order-again", "stores"]);

export default async function SeeAllPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!KINDS.has(kind as DiscoverySeeAllKind)) notFound();
  return <DiscoverySeeAllPage kind={kind as DiscoverySeeAllKind} />;
}
