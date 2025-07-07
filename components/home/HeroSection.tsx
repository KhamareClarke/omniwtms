"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SignupModal from "./SignupModal";
import Image from "next/image";

export default function HeroSection() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleCtaClick = () => {
    setIsSignupModalOpen(true);
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 py-10 sm:py-16 md:py-24 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-blue-100 opacity-50"></div>

      <div className="container mx-auto relative z-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center pt-4 sm:pt-6 md:pt-8">
          {/* AI Tagline */}
          <div className="flex items-center mt-12 md:mt-0 justify-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs sm:text-sm text-green-800 font-medium">
                AI-Powered Warehouse and Logistics Command Center
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight px-2">
            <span
              className="block bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-transparent bg-clip-text animate-gradient-slow"
              style={{ WebkitFontSmoothing: "antialiased" }}
            >
              Your all-in-one Warehouse & Transport Management System
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
            Take full control of your warehouse and transport operations with
            OmniWTMS — built for growth, speed, and simplicity.
          </p>

          {/* Feature Pills */}
          <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-sm text-xs sm:text-sm md:text-base">
              <span className="text-red-500">🚚</span>
              <span className="text-gray-700">Track Vehicles in Real-time</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-sm text-xs sm:text-sm md:text-base">
              <span className="text-blue-500">📊</span>
              <span className="text-gray-700">Cut Admin Time by 60%</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-sm text-xs sm:text-sm md:text-base">
              <span className="text-purple-500">📦</span>
              <span className="text-gray-700">Eliminate Inventory Errors</span>
            </div>
          </div>

          <div className="mt-2 sm:mt-3 flex justify-center">
            <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-sm text-xs sm:text-sm md:text-base">
              <span className="text-orange-500">💰</span>
              <span className="text-gray-700">Reduce Billing Time by 40%</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button
              size="lg"
              onClick={handleCtaClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-base sm:text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border-0"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              onClick={handleCtaClick}
              className="bg-gradient-to-r from-white to-gray-50 border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-base sm:text-lg font-medium rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              See It In Action{" "}
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 px-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                Easy 24-48hr Setup
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                GDPR Compliant
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                No-Risk Free Trial
              </span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 px-1">
            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="text-blue-500 mb-1 sm:mb-2">⚡</div>
              <div className="text-xs sm:text-sm font-medium text-gray-800 text-center">
                Track Vehicles in Real-time
              </div>
            </div>

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="text-green-500 mb-1 sm:mb-2">📈</div>
              <div className="text-xs sm:text-sm font-medium text-gray-800 text-center">
                Cut Admin Time by 60%
              </div>
            </div>

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="text-orange-500 mb-1 sm:mb-2">🎯</div>
              <div className="text-xs sm:text-sm font-medium text-gray-800 text-center">
                Eliminate Inventory Errors
              </div>
            </div>

            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="text-purple-500 mb-1 sm:mb-2">📊</div>
              <div className="text-xs sm:text-sm font-medium text-gray-800 text-center">
                Reduce Billing Time by 40%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </div>
  );
}
