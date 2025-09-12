import React from "react";

export default function SolutionsSection() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-blue-50 to-white"
      id="solutions"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 text-transparent bg-clip-text animate-gradient-slow">
          Unlock the Full Potential of Your Supply Chain
        </h2>
        <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto mb-12 font-medium">
          OmniWTMS empowers you to streamline warehouse, transport, and customer
          operations, eliminating bottlenecks and boosting efficiency. Discover
          how our solutions can help you delight your customers and stay ahead
          of the competition.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-blue-100 hover:shadow-xl transition flex flex-col items-center text-center min-h-[400px]">
            <div className="bg-blue-50 rounded-full p-4 mb-6">
              <span className="text-4xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-700 mb-6">
              Optimize Your Warehouse Operations
            </h3>
            <ul className="space-y-4 text-gray-700 text-left mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                <span>Maximize storage capacity and reduce costs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                <span>Streamline inventory management and tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1 flex-shrink-0">✓</span>
                <span>Improve order fulfillment and shipping accuracy</span>
              </li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 w-full">
              <span className="text-sm text-blue-700 font-semibold">
                For: Warehouse Managers, Logistics Coordinators
              </span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-indigo-100 hover:shadow-xl transition flex flex-col items-center text-center min-h-[400px]">
            <div className="bg-indigo-50 rounded-full p-4 mb-6">
              <span className="text-4xl">🚚</span>
            </div>
            <h3 className="text-2xl font-bold text-indigo-700 mb-6">
              Transform Your Transportation Operations
            </h3>
            <ul className="space-y-4 text-gray-700 text-left mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">✓</span>
                <span>Optimize routes and reduce fuel consumption</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">✓</span>
                <span>Improve driver safety and reduce accidents</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">✓</span>
                <span>Enhance customer experience with real-time tracking</span>
              </li>
            </ul>
            <div className="bg-indigo-50 rounded-lg p-3 w-full">
              <span className="text-sm text-indigo-700 font-semibold">
                For: Transportation Managers, Fleet Operators
              </span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-purple-100 hover:shadow-xl transition flex flex-col items-center text-center min-h-[400px]">
            <div className="bg-purple-50 rounded-full p-4 mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-purple-700 mb-6">
              Unlock Data-Driven Insights
            </h3>
            <ul className="space-y-4 text-gray-700 text-left mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1 flex-shrink-0">✓</span>
                <span>Gain real-time visibility into your operations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1 flex-shrink-0">✓</span>
                <span>Make data-driven decisions with customizable dashboards</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1 flex-shrink-0">✓</span>
                <span>Improve operational efficiency and reduce costs</span>
              </li>
            </ul>
            <div className="bg-purple-50 rounded-lg p-3 w-full">
              <span className="text-sm text-purple-700 font-semibold">
                For: Operations Managers, Business Analysts
              </span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-green-100 hover:shadow-xl transition flex flex-col items-center text-center min-h-[400px]">
            <div className="bg-green-50 rounded-full p-4 mb-6">
              <span className="text-4xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-6">
              Delight Your Customers
            </h3>
            <ul className="space-y-4 text-gray-700 text-left mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span>Provide real-time order tracking and updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span>Offer flexible delivery options and scheduling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span>Improve customer satisfaction and loyalty</span>
              </li>
            </ul>
            <div className="bg-green-50 rounded-lg p-3 w-full">
              <span className="text-sm text-green-700 font-semibold">
                For: Customer Service Managers, Marketing Teams
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10">
          <button
            onClick={() => {
              window.open("https://calendly.com/khamareclarke/30min", "_blank");
            }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-all duration-300 border-0"
          >
            See How OmniWTMS Helps
          </button>
          <button
            onClick={() => {
              window.open("https://calendly.com/khamareclarke/30min", "_blank");
            }}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-yellow-600 text-white font-bold text-lg shadow-lg hover:bg-yellow-700 transition-all duration-200 border-2 border-yellow-600 hover:border-yellow-700"
          >
            Download Our Solutions Brochure
          </button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
            Trusted by 250+ UK Logistics Firms
          </span>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
            ISO 27001 Certified
          </span>
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
            GDPR Compliant
          </span>
        </div>
      </div>
    </section>
  );
}
