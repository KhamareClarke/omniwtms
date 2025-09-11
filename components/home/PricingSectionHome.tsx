import React from "react";
import ComparisonTable from "./ComparisonTable";
import CountdownSlots from "./CountdownSlots";

import Head from "next/head";
import { useState } from "react";
import PlanCtaModal from "./PlanCtaModal";

export default function PricingSectionHome() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "growth" | null>(
    null
  );
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Transparent UK SaaS pricing for OmniWTMS. No setup fees, cancel anytime, all features included. Compare plans and book your free demo today!"
        />
      </Head>
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-white to-blue-50"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 text-transparent bg-clip-text animate-gradient-slow">
            Simple, Competitive UK Pricing — No Surprises
          </h2>
          <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto mb-12 font-medium">
            All plans include every feature, UK-based support, and rapid
            onboarding. No setup fees. Cancel anytime.
          </p>
          <CountdownSlots />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition flex flex-col relative">
              <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                Starter
              </span>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">
                £599<span className="text-base font-medium">/mo</span>
              </h3>
              <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                <li>Up to 1,000 deliveries/month</li>
                <li>5 users</li>
                <li>1 warehouse</li>
              </ul>
              <div className="text-gray-600 text-sm mb-4">
                Perfect for small UK warehouses & courier firms.
              </div>
              {/* Value Stack */}
              <div className="bg-blue-50 rounded-xl px-4 py-3 mb-4 mt-2 shadow border border-blue-100">
                <h4 className="text-base font-semibold text-blue-700 mb-1">
                  What's Included
                </h4>
                <div className="flex justify-between text-sm font-medium">
                  <span>Warehouse Management</span>
                  <span>£400/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Transport & Fleet</span>
                  <span>£250/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Order Automation</span>
                  <span>£150/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Support & Onboarding</span>
                  <span>£100/mo</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2">
                  <span>Total Value</span>
                  <span className="text-blue-700">£900/mo</span>
                </div>
                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold mt-2 text-center">
                  You save <span className="font-bold">£301/mo</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalOpen(true);
                  setSelectedPlan("starter");
                }}
                className="mt-auto inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 border-0 text-center rounded-lg"
              >
                Secure Plan
              </button>
            </div>
            {/* Growth Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-yellow-400 hover:shadow-2xl transition flex flex-col scale-105 relative z-10">
              <span className="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                Growth
              </span>
              <h3 className="text-2xl font-bold text-yellow-700 mb-2">
                £1,199<span className="text-base font-medium">/mo</span>
              </h3>
              <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                <li>Up to 10,000 deliveries/month</li>
                <li>25 users</li>
                <li>Multi-warehouse</li>
                <li>Priority support</li>
              </ul>
              <div className="text-gray-600 text-sm mb-4">
                Ideal for scaling 3PLs & regional distribution firms.
              </div>
              {/* Value Stack */}
              <div className="bg-yellow-50 rounded-xl px-4 py-3 mb-4 mt-2 shadow border border-yellow-200">
                <h4 className="text-base font-semibold text-yellow-700 mb-1">
                  What's Included
                </h4>
                <div className="flex justify-between text-sm font-medium">
                  <span>Multi-Warehouse Ops</span>
                  <span>£800/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Advanced Routing</span>
                  <span>£500/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Priority Support</span>
                  <span>£200/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Integrations</span>
                  <span>£200/mo</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2">
                  <span>Total Value</span>
                  <span className="text-yellow-700">£1,700/mo</span>
                </div>
                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold mt-2 text-center">
                  You save <span className="font-bold">£501/mo</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalOpen(true);
                  setSelectedPlan("growth");
                }}
                className="mt-auto inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 border-0 text-center rounded-lg"
              >
                Secure Growth
              </button>
            </div>
            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-200 hover:shadow-xl transition flex flex-col relative">
              <span className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                Enterprise
              </span>
              <h3 className="text-2xl font-bold text-purple-700 mb-2">
                Custom
              </h3>
              <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                <li>Unlimited deliveries</li>
                <li>Unlimited users</li>
                <li>Dedicated account manager</li>
                <li>Custom integrations</li>
              </ul>
              <div className="text-xs text-purple-700 mb-2 text-center">
                Flexible contracts. Dedicated onboarding.
              </div>
              {/* Value Stack */}
              <div className="bg-purple-50 rounded-xl px-4 py-3 mb-4 mt-2 shadow border border-purple-200">
                <h4 className="text-base font-semibold text-purple-700 mb-1">
                  What's Included
                </h4>
                <div className="flex justify-between text-sm font-medium">
                  <span>Unlimited Users & Deliveries</span>
                  <span>£2,000/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Dedicated Account Manager</span>
                  <span>£500/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Custom Integrations</span>
                  <span>£500/mo</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Custom Onboarding</span>
                  <span>£300/mo</span>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2">
                  <span>Total Value</span>
                  <span className="text-purple-700">£3,300/mo</span>
                </div>
                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold mt-2 text-center">
                  You save <span className="font-bold">Custom</span>
                </div>
              </div>
              <a
                href="https://calendly.com/khamareclarke/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300 border-0 text-center"
              >
                Talk to Sales
              </a>
            </div>
          </div>

          {/* All Plans Include - Enhanced Premium Bar */}
          <div className="w-full flex justify-center mt-20 relative z-40">
            <div className="bg-white/90 backdrop-blur-md border border-blue-200 shadow-lg rounded-2xl px-4 py-3 mb-10 max-w-4xl w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <span className="text-base md:text-lg font-bold text-blue-800 flex items-center gap-2 mb-1 sm:mb-0">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                All plans include:
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center w-full">
                <span
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Unlimited support
                </span>
                <span
                  className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 9V7a5 5 0 0 0-10 0v2a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
                  </svg>
                  UK data residency
                </span>
                <span
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2l4-4" />
                  </svg>
                  Free onboarding
                </span>
                <span
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 20v-6h4v6m1-16h-6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  </svg>
                  All integrations
                </span>
                <span
                  className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-2.07A8.12 8.12 0 0 1 4.07 13H7a1 1 0 0 1 0 2H4.07A8.12 8.12 0 0 1 11 19.93z" />
                  </svg>
                  Mobile & desktop access
                </span>
                <span
                  className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-medium text-sm shadow-sm min-w-[140px] mb-2"
                  style={{ marginRight: "4px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Security & compliance
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Table: OmniWTMS vs Clarus vs Mandata */}
          <ComparisonTable />
        </div>
        <PlanCtaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={selectedPlan as "starter" | "growth"}
        />
      </section>
    </>
  );
}
