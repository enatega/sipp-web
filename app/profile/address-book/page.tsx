import type { Metadata } from "next";
import { AddressBook } from "@/modules/account";

export const metadata: Metadata = {
  title: "Address Book | SIPP",
};

export default function AddressBookPage() {
  return <AddressBook />;
}
