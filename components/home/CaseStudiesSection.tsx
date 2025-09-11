import React from 'react';
import Head from 'next/head';

export default function CaseStudiesSection() {
  return (
    <>
      <Head>
        <meta name="description" content="See real-world results from UK logistics firms using OmniWTMS. Case studies: admin time cut 60%, 99.8% accuracy, £1.2M+ saved. Download PDF success stories." />
      </Head>
      <section id="case-studies" className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 text-transparent bg-clip-text animate-gradient-slow">
  Results UK Logistics Firms Can Bank On
</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* 3PL Case Study */}
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition flex flex-col">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs mb-2">3PL</span>
        <h3 className="text-xl font-bold mb-1">60% Less Admin Time</h3>
        <p className="text-gray-600 text-sm">“Onboarding new clients in hours, not weeks. Admin workload dropped by half.”</p>
      </div>
      <div className="mt-auto text-sm text-gray-500">— Operations Director, City Express Logistics</div>
    </div>
    {/* E-Commerce Case Study */}
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition flex flex-col">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-xs mb-2">E-Commerce</span>
        <h3 className="text-xl font-bold mb-1">99.8% Accuracy</h3>
        <p className="text-gray-600 text-sm">“No more stockouts or mis-picks. Total trust in the numbers.”</p>
      </div>
      <div className="mt-auto text-sm text-gray-500">— Head of Fulfillment, ShopRocket</div>
    </div>
    {/* Transport Case Study */}
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition flex flex-col">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs mb-2">Transport</span>
        <h3 className="text-xl font-bold mb-1">Real-Time Fleet Visibility &amp; Billing Cut by 40%</h3>
        <p className="text-gray-600 text-sm">“We see every delivery in real time and bill clients in minutes, not days.”</p>
      </div>
      <div className="mt-auto text-sm text-gray-500">— Fleet Manager, UK National Couriers</div>
    </div>
  </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
  <a href="https://calendly.com/khamareclarke/30min" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-all duration-300 border-0">
    See More Success Stories
  </a>
  <a href="https://calendly.com/khamareclarke/30min" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-white border border-blue-400 text-blue-700 text-lg font-bold rounded-xl shadow hover:scale-105 transition-all duration-300">
    Download Case Studies PDF
  </a>
</div>
<div className="mt-8 flex flex-wrap justify-center gap-4">
  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">250+ UK Logistics Firms</span>
  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">£1.2M+ Saved Annually</span>
  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">99.8% Accuracy</span>
  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">ISO 27001 & GDPR</span>
</div>
      </div>
    </section>
    </>
  );
}
