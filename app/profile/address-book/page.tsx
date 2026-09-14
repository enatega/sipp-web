import type { Metadata } from "next";
import { AddressBook } from "@/modules/account";

export const metadata: Metadata = {
  title: "Address Book | Shaaneiol",
};

export default function AddressBookPage() {
  return <AddressBook />;
}
