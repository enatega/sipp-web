import { Header } from "@/components/shared/app-shell/Header";
import { Footer } from "@/components/shared/app-shell/Footer";
import { LandingShopTypesSection } from "@/modules/deliveries";
import {
  AppSection,
  EverythingSection,
  FoodSection,
  HeroSection,
  HomePage,
  ProductsSection,
  ValueSection,
} from "@/modules/home";

export default function Home() {
  return (
    <>
      <Header />
      <HomePage>
        <HeroSection />
        <LandingShopTypesSection />
        <FoodSection />
        <EverythingSection />
        <ValueSection />
        {/* <ProductsSection /> */}
        <AppSection />
      </HomePage>
      <Footer />
    </>
  );
}
