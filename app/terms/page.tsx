import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import {
  TermsBodySection,
  TermsDefinitionsSection,
  TermsHero,
  TermsPage,
  TermsPreambleSection,
} from "@/modules/terms";

export async function generateMetadata() {
  const t = await getTranslations("terms");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function Terms() {
  return (
    <>
      <Header />
      <TermsPage>
        <TermsHero />
        <TermsPreambleSection />
        <TermsDefinitionsSection />
        <TermsBodySection />
      </TermsPage>
      <Footer />
    </>
  );
}
