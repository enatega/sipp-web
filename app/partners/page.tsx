import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import {
  PartnersClosingSection,
  PartnersCtaSection,
  PartnersHero,
  PartnersPage,
} from "@/modules/partners";

export async function generateMetadata() {
  const t = await getTranslations("partners");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function Partners() {
  return (
    <>
      <Header />
      <PartnersPage>
        <PartnersHero />
        <PartnersCtaSection />
        <PartnersClosingSection />
      </PartnersPage>
      <Footer />
    </>
  );
}
