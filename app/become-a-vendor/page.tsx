import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/app-shell/Footer";
import { Header } from "@/components/shared/app-shell/Header";
import { VendorOnboardingExperience } from "@/modules/vendor-onboarding";

export async function generateMetadata() {
  const t = await getTranslations("vendorOnboarding");
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default function BecomeAVendorPage() {
  return (
    <>
      <Header />
      <VendorOnboardingExperience />
      <Footer />
    </>
  );
}
