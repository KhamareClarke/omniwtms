"use client";

import Header from "../components/layout/header";
import HeroSection from "../components/home/HeroSection";
// import CompactTestimonialBanner from "@/components/CompactTestimonialBanner";
import VideoShowcase from "../components/home/VideoShowcase";
import CaseStudy from "../components/home/CaseStudy";
// import EvolutionSection from "../components/sections/EvolutionSection";
import PlatformFeatures from "../components/home/PlatformFeatures";
import CommandAdvantage from "../components/home/CommandAdvantage";
import NewTestimonialsSection from "../components/home/NewTestimonialsSection";
import PricingSection from "../components/home/PricingSection";
import DemoSection from "../components/home/DemoSection";
import FAQSection from "../components/home/FAQSection";
import LogoCarouselSection from "../components/home/LogoCarouselSection";
import Footer from "../components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section id="home">
          <HeroSection />
        </section>
        <section id="demo-video">
          <VideoShowcase />
        </section>
        <LogoCarouselSection />

        <section
          id="case-study"
          className="py-16 bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real Results, Real Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See how our customers transformed their operations with OmniWTMS
              </p>
            </div>
            <CaseStudy />
          </div>
        </section>
        <section id="features">
          <PlatformFeatures />
          <CommandAdvantage />
        </section>
        <section id="case-studies">
          <NewTestimonialsSection />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
        <section id="contact">
          <DemoSection />
        </section>
        <section id="faq">
          <FAQSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
