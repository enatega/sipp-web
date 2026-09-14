import { getTranslations } from "next-intl/server";
import { Header } from "@/components/shared/app-shell/Header";
import { SupportExperience } from "@/modules/deliveries/components/support/SupportExperience";
export async function generateMetadata() { const t = await getTranslations("deliveries.support"); return { title: t("title") }; }
export default function HelpPage() { return <><Header /><SupportExperience /></>; }
