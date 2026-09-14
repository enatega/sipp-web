import type { Metadata } from "next";
import { PersonalInformation } from "@/modules/account";

export const metadata: Metadata = {
  title: "Personal Information | Shaaneiol",
};

export default function PersonalInformationPage() {
  return <PersonalInformation />;
}
