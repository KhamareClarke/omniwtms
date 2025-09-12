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
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition flex flex-col items-center text-center">
            <span className="text-4xl mb-3">📈</span>
            <h3 className="text-2xl font-bold text-blue-700 mb-2">
              Optimize Your Warehouse Operations
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-left mb-3">
              <li>Maximize storage capacity and reduce costs</li>
              <li>Streamline inventory management and tracking</li>
              <li>Improve order fulfillment and shipping accuracy</li>
            </ul>
            <span className="text-xs text-blue-700 font-semibold mt-auto">
              For: Warehouse Managers, Logistics Coordinators
            </span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 hover:shadow-xl transition flex flex-col items-center text-center">
            <span className="text-4xl mb-3">🚚</span>
            <h3 className="text-2xl font-bold text-indigo-700 mb-2">
              Transform Your Transportation Operations
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-left mb-3">
              <li>Optimize routes and reduce fuel consumption</li>
              <li>Improve driver safety and reduce accidents</li>
              <li>Enhance customer experience with real-time tracking</li>
            </ul>
            <span className="text-xs text-indigo-700 font-semibold mt-auto">
              For: Transportation Managers, Fleet Operators
            </span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition flex flex-col items-center text-center">
            <span className="text-4xl mb-3">📊</span>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              Unlock Data-Driven Insights
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-left mb-3">
              <li>Gain real-time visibility into your operations</li>
              <li>Make data-driven decisions with customizable dashboards</li>
              <li>Improve operational efficiency and reduce costs</li>
            </ul>
            <span className="text-xs text-purple-700 font-semibold mt-auto">
              For: Operations Managers, Business Analysts
            </span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition flex flex-col items-center text-center">
            <span className="text-4xl mb-3">📈</span>
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              Delight Your Customers
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-left mb-3">
              <li>Provide real-time order tracking and updates</li>
              <li>Offer flexible delivery options and scheduling</li>
              <li>Improve customer satisfaction and loyalty</li>
            </ul>
            <span className="text-xs text-green-700 font-semibold mt-auto">
              For: Customer Service Managers, Marketing Teams
            </span>
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
