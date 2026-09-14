import { Header } from "@/components/shared/app-shell/Header";
import { Footer } from "@/components/shared/app-shell/Footer";
import {
  AppSection,
  EverythingSection,
  FoodSection,
  HeroSection,
  HomePage,
  ProductsSection,
  ServiceStrip,
  ValueSection,
} from "@/modules/home";

export default function Home() {
  return (
    <>
      <Header />
      <HomePage>
        <HeroSection />
        <ServiceStrip />
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
