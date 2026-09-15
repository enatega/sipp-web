import type { Metadata } from "next";
import { PersonalInformation } from "@/modules/account";

export const metadata: Metadata = {
  title: "Personal Information | SIPP",
};

export default function PersonalInformationPage() {
  return <PersonalInformation />;
}
