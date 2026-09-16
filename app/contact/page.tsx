import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { ContactDetailsSection, ContactMapBanner, ContactPage } from "@/modules/contact";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function Contact() {
  return (
    <>
      <Header />
      <ContactPage>
        <ContactMapBanner />
        <ContactDetailsSection />
      </ContactPage>
      <Footer />
    </>
  );
}
