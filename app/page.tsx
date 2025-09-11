"use client";

import Header from "../components/layout/header";
import HeroSection from "@/components/home/HeroSection";
import DemoSection from "@/components/home/DemoSection";
// import CompactTestimonialBanner from "@/components/CompactTestimonialBanner";
import VideoShowcase from "../components/home/VideoShowcase";
import CaseStudy from "../components/home/CaseStudy";
// import EvolutionSection from "../components/sections/EvolutionSection";
import PlatformFeatures from "../components/home/PlatformFeatures";
import CommandAdvantage from "../components/home/CommandAdvantage";
import NewTestimonialsSection from "../components/home/NewTestimonialsSection";
import PricingSection from "../components/home/PricingSection";
import FAQSection from "../components/home/FAQSection";
import LogoCarouselSection from "../components/home/LogoCarouselSection";
import Footer from "../components/layout/footer";
import SolutionsSection from "@/components/home/SolutionsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CaseStudiesSection from "@/components/home/CaseStudiesSection";
import PricingSectionHome from "@/components/home/PricingSectionHome";
import CookieConsent from "@/components/CookieConsent";
import LiveChatWidget from "@/components/LiveChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* SEO: FAQPage & Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is there a setup fee or long-term contract?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No setup fees, no long-term contracts. Cancel anytime.",
                },
              },
              {
                "@type": "Question",
                name: "What support is included?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All plans include unlimited UK-based support by phone, email, and live chat.",
                },
              },
              {
                "@type": "Question",
                name: "Can I migrate from another system?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we provide free onboarding and migration assistance from your current provider.",
                },
              },
              {
                "@type": "Question",
                name: "Are all features really included?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, every plan includes all core features. Add-ons are optional.",
                },
              },
              {
                "@type": "Question",
                name: "Is OmniWTMS secure and GDPR compliant?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we are fully GDPR compliant and ISO 27001 certified.",
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "OmniWTMS",
            url: "https://omniwtms.com",
            logo: "https://omniwtms.com/logo.png",
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "info@omniwtms.com",
                contactType: "customer support",
                areaServed: "GB",
                availableLanguage: ["English"],
              },
            ],
            address: {
              "@type": "PostalAddress",
              addressCountry: "GB",
            },
            sameAs: ["https://www.linkedin.com/company/omniwtms"],
            description:
              "OmniWTMS is the UK's all-in-one warehouse and transport management platform for logistics, 3PL, and courier firms.",
          }),
        }}
      />
      <Header />
      <main>
        <section id="home">
          <HeroSection />
        </section>
        <SolutionsSection />
        <FeaturesSection />
        <CaseStudiesSection />
        <PricingSectionHome />
        <section id="contact">
          <DemoSection />
        </section>
        {/* <section id="demo-video">
          <VideoShowcase />
        </section> */}
        {/* <LogoCarouselSection /> */}

        {/* <section
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
        </section> */}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
