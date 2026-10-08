import { Suspense } from "react";
import { SearchListingPage } from "@/modules/deliveries/components/search/SearchListingPage";

export default function Page() {
  return <Suspense><SearchListingPage resource="stores" /></Suspense>;
}
