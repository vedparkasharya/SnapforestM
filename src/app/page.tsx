import Hero from "@/components/rooms/Hero";
import PartnersMarquee from "@/components/sections/PartnersMarquee";
import Features from "@/components/sections/Features";
import RoomList from "@/components/rooms/RoomList";
import ServicesMarquee from "@/components/sections/ServicesMarquee";
import PricingSection from "@/components/sections/Pricing";
import LocationShowcase from "@/components/sections/Location";
import Testimonials from "@/components/sections/Testimonials";
import CTABanner from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <main className="bg-[#111111]">
      {/* 1. Hero with Voxel Waterfall */}
      <Hero />

      {/* 2. Partners Marquee */}
      <PartnersMarquee />

      {/* 3. Features / How It Works */}
      <Features />

      {/* 4. Studio Showcase */}
      <RoomList />

      {/* 5. Services Marquee */}
      <ServicesMarquee />

      {/* 6. Pricing */}
      <PricingSection />

      {/* 7. Location Showcase */}
      <LocationShowcase />

      {/* 8. Testimonials */}
      <Testimonials />

      {/* 9. CTA Banner */}
      <CTABanner />
    </main>
  );
}
