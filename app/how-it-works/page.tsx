import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import {
  HowItWorksClosingSection,
  HowItWorksDeliveryAreaSection,
  HowItWorksHero,
  HowItWorksPage,
  HowItWorksStepsSection,
} from "@/modules/how-it-works";

export async function generateMetadata() {
  const t = await getTranslations("howItWorks");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function HowItWorks() {
  return (
    <>
      <Header />
      <HowItWorksPage>
        <HowItWorksHero />
        <HowItWorksStepsSection />
        <HowItWorksDeliveryAreaSection />
        <HowItWorksClosingSection />
      </HowItWorksPage>
      <Footer />
    </>
  );
}
