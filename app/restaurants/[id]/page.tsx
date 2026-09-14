import { RestaurantPage } from "@/modules/deliveries";

export default async function RestaurantRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RestaurantPage storeId={(await params).id} />;
}
