import { Suspense } from "react";
import { SearchPage } from "@/modules/deliveries/components/search/SearchPage";

export default function Page() {
  return <Suspense><SearchPage /></Suspense>;
}
