import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import {
  AboutDifferentSection,
  AboutHero,
  AboutLocalSection,
  AboutMissionSection,
  AboutOriginSection,
  AboutPage,
  AboutTaglineSection,
} from "@/modules/about";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function About() {
  return (
    <>
      <Header />
      <AboutPage>
        <AboutHero />
        <AboutOriginSection />
        <AboutDifferentSection />
        <AboutLocalSection />
        <AboutMissionSection />
        <AboutTaglineSection />
      </AboutPage>
      <Footer />
    </>
  );
}
