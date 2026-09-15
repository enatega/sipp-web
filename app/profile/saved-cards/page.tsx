import type { Metadata } from "next";
import { SavedCards } from "@/modules/account";

export const metadata: Metadata = {
  title: "Saved Cards | SIPP",
};

export default function SavedCardsPage() {
  return <SavedCards />;
}
