import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { PrivacyBodySection, PrivacyHero, PrivacyPage } from "@/modules/privacy";

export async function generateMetadata() {
  const t = await getTranslations("privacy");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function Privacy() {
  return (
    <>
      <Header />
      <PrivacyPage>
        <PrivacyHero />
        <PrivacyBodySection />
      </PrivacyPage>
      <Footer />
    </>
  );
}
