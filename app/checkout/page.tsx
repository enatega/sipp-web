import { CheckoutPage } from "@/modules/deliveries";

interface Props {
  searchParams: Promise<{ draft?: string; payment?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const query = await searchParams;
  const stripeDraftId = query.payment === "return" ? query.draft : undefined;
  return <CheckoutPage initialStripeDraftId={stripeDraftId} wasCardPaymentCancelled={query.payment === "cancelled"} />;
}
