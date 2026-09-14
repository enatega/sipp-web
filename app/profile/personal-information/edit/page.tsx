import type { Metadata } from "next";
import { PersonalInformation } from "@/modules/account";

export const metadata: Metadata = {
  title: "Edit Personal Information | Shaaneiol",
};

export default function EditPersonalInformationPage() {
  return <PersonalInformation editing />;
}
