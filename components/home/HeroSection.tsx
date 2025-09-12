"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// import SignupModal from "@/components/SignupModal";
import Image from "next/image";
import Head from "next/head";

export default function HeroSection() {
  // --- Typewriter animation state ---
  // Cinematic typewriter effect: sentence-by-sentence
  const sentences = [
    { text: "From pallet to doorstep.", duration: 1500 },
    { text: "Get real-time control.", duration: 1200 },
    { text: "Every warehouse.", duration: 1200 },
    { text: "Every vehicle.", duration: 1000 },
    { text: "Every delivery.", duration: 1500 },
  ];
  const pause = 500;
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let charIdx = 0;
    let typingTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;
    let cursorFadeTimeout: NodeJS.Timeout;
    setTyped("");
    setIsTyping(true);
    setShowCursor(true);
    function typeChar() {
      if (charIdx <= sentences[sentenceIdx].text.length) {
        setTyped(sentences[sentenceIdx].text.slice(0, charIdx));
        charIdx++;
        typingTimeout = setTimeout(
          typeChar,
          sentences[sentenceIdx].duration / sentences[sentenceIdx].text.length
        );
      } else {
        setIsTyping(false);
        if (sentenceIdx < sentences.length - 1) {
          pauseTimeout = setTimeout(() => {
            setSentenceIdx((idx) => idx + 1);
          }, pause);
        } else {
          // Fade out cursor after final sentence, then restart loop
          cursorFadeTimeout = setTimeout(() => {
            setShowCursor(false);
            setTimeout(() => {
              setSentenceIdx(0);
              setShowCursor(true);
            }, 1000);
          }, 700);
        }
      }
    }
    typeChar();
    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(pauseTimeout);
      clearTimeout(cursorFadeTimeout);
    };
  }, [sentenceIdx]);

  // --- A/B CTA assignment ---
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const ab = React.useMemo(() => {
    // Stable random assignment per session
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w.__ab_cta) {
        w.__ab_cta = Math.random() > 0.5 ? "A" : "B";
      }
      return w.__ab_cta;
    }
    return "A";
  }, []);
  const mainCta = ab === "A" ? "Get Started" : "Book Free Demo";
  const secondaryCta = ab === "A" ? "See It In Action" : "Download Brochure";

  // Use this for all CTAs except Sign In
  const handleBookCalendar = () => {
    window.open("https://calendly.com/khamareclarke/30min", "_blank");
  };

  const handleCtaClick = () => {
    setIsSignupModalOpen(true);
  };

  return (
    <>
      <Head>
        <meta
          name="description"
          content="OmniWTMS: The UK's all-in-one AI-powered warehouse and transport management system. Real-time control, fast setup, and no-risk free trial."
        />
      </Head>
      <div className="relative min-h-[70vh] bg-gradient-to-br from-[#0a1642] via-[#1a237e] to-[#2e1667] py-10 sm:py-16 md:py-24 overflow-hidden flex items-center justify-center">
        {/* Cinematic background overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80 blur-2xl"
            style={{ zIndex: 1 }}
          ></div>
          <div
            className="absolute left-1/3 top-0 w-2/3 h-1/2 bg-gradient-to-tr from-blue-600/20 via-purple-500/10 to-indigo-700/20 rounded-full filter blur-3xl opacity-60 animate-pulse-slow"
            style={{ zIndex: 2 }}
          ></div>
          <div
            className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-400/20 via-purple-500/10 to-blue-700/20 rounded-full filter blur-2xl opacity-40 animate-pulse-slow"
            style={{ zIndex: 2 }}
          ></div>
          <div
            className="absolute inset-0 bg-grid-blue-100 opacity-30"
            style={{ zIndex: 3 }}
          ></div>
        </div>
        <div className="container mx-auto relative z-10 px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center">
          {/* AI Tagline */}
          <div className="flex items-center justify-center mb-8 mt-2 px-4">
            <div className="inline-flex items-center px-3 sm:px-5 py-2 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 shadow-md max-w-full">
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-blue-700 tracking-wide text-center leading-tight">
                <span className="block sm:hidden">AI-Powered UK Warehouse & Transport System</span>
                <span className="hidden sm:block">AI-Powered UK Warehouse & Transport Management System</span>
              </span>
            </div>
          </div>

          {/* Cinematic Animated Headline */}
          <div className="relative flex flex-col items-center justify-center min-h-[110px] xs:min-h-[140px] sm:min-h-[180px] md:min-h-[220px] lg:min-h-[260px] w-full">
            <h1
              className={clsx(
                "font-sora text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-center select-none uppercase",
                "text-white",
                "antialiased drop-shadow-lg",
                "break-words max-w-full px-2",
                "min-h-[80px] xs:min-h-[100px] sm:min-h-[120px] md:min-h-[180px] flex items-center justify-center"
              )}
              aria-live="polite"
              style={{
                WebkitFontSmoothing: "antialiased",
                lineHeight: 1.2,
                letterSpacing: "-.01em",
                textShadow: "0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              <span className="relative">
                {typed}
                {/* Solid fallback for better compatibility */}
                <span 
                  className="absolute inset-0 text-white opacity-100 z-[-1]" 
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    WebkitTextFillColor: 'white',
                    color: 'white'
                  }}
                >
                  {typed}
                </span>
              </span>
              {showCursor ? (
                <span
                  className={clsx(
                    "inline-block w-1 sm:w-2 md:w-3 animate-pulse ml-1",
                    "bg-white h-6 xs:h-8 sm:h-10 md:h-16 lg:h-20",
                    !isTyping && sentenceIdx === 4 ? "opacity-0" : "opacity-100"
                  )}
                  style={{ textShadow: "0 0 10px rgba(255,255,255,0.8)" }}
                >
                </span>
              ) : null}
            </h1>
          </div>

          {/* Subheadline, CTA, Benefits, Trust - always visible */}
          <p className="mt-4 text-base xs:text-lg sm:text-xl md:text-2xl text-gray-100 max-w-xl mx-auto font-semibold text-center drop-shadow-lg font-sora antialiased">
            Built for growth. Designed for speed. Engineered for simplicity.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() =>
                window.open(
                  "https://calendly.com/khamareclarke/30min",
                  "_blank"
                )
              }
              className="px-10 py-4 text-xl font-bold uppercase rounded-full bg-[#0048ff] text-white transition-colors duration-200 hover:bg-[#0037cc] focus:outline-none focus:ring-2 focus:ring-[#0048ff] focus:ring-offset-2 border-0 antialiased"
            >
              <span className="relative z-10">{mainCta}</span>
            </Button>
            <Button
              size="lg"
              onClick={() =>
                window.open(
                  "https://calendly.com/khamareclarke/30min",
                  "_blank"
                )
              }
              className="px-10 py-4 text-xl font-bold uppercase rounded-full bg-yellow-600 text-white border-2 border-yellow-600 transition-colors duration-200 hover:bg-yellow-700 hover:border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 antialiased flex items-center gap-2 justify-center shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                {secondaryCta}
                {ab === "A" ? <ArrowRight className="h-5 w-5" /> : null}
              </span>
            </Button>
          </div>

          {/* Benefit Highlights */}
          <div className="mt-8 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 w-full max-w-xl xs:max-w-2xl md:max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-white/80 rounded-lg shadow-md px-4 py-3 border border-blue-100">
              <span className="text-2xl">🚚</span>
              <span className="font-semibold text-gray-900">
                Track Vehicles in Real-time
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-lg shadow-md px-4 py-3 border border-blue-100">
              <span className="text-2xl">📊</span>
              <span className="font-semibold text-gray-900">
                Cut Admin Time by 60%
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-lg shadow-md px-4 py-3 border border-blue-100">
              <span className="text-2xl">📦</span>
              <span className="font-semibold text-gray-900">
                Eliminate Inventory Errors
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/80 rounded-lg shadow-md px-4 py-3 border border-blue-100">
              <span className="text-2xl">💰</span>
              <span className="font-semibold text-gray-900">
                Reduce Billing Time by 40%
              </span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-green-50 rounded-full px-4 py-2 shadow-sm">
              <span className="text-green-600 font-bold">
                Easy 24-48hr Setup
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 shadow-sm">
              <span className="text-blue-600 font-bold">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 rounded-full px-4 py-2 shadow-sm">
              <span className="text-purple-700 font-bold">
                No-Risk Free Trial
              </span>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </>
  );
}
