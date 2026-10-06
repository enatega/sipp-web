import { FavouriteFoodProductsPage } from "@/modules/deliveries/components/discovery/FavouriteFoodProductsPage";

interface Props {
  params: Promise<{ foodId: string }>;
  searchParams: Promise<{ shopTypeId?: string | string[] }>;
}

export default async function Page({ params, searchParams }: Props) {
  const [{ foodId }, query] = await Promise.all([params, searchParams]);
  const shopTypeId = typeof query.shopTypeId === "string" ? query.shopTypeId : null;
  return <FavouriteFoodProductsPage foodId={foodId} shopTypeId={shopTypeId} />;
}
