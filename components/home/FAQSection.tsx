"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  // Define FAQ items with questions and answers
  const faqs = [
    {
      question: "Is OmniWTMS right for small businesses?",
      answer:
        "Absolutely! OmniWTMS is designed to scale with your business. Our Starter plan is specifically tailored for small businesses with 1-5 vehicles, while offering all the core features needed to streamline your operations. As your business grows, our platform grows with you.",
    },
    {
      question:
        "Do you support fleet tracking and real-time vehicle monitoring?",
      answer:
        "Yes, OmniWTMS offers comprehensive fleet tracking with real-time GPS monitoring, route optimization, and driver performance analytics. You'll always know where your vehicles are, how efficiently they're performing, and receive instant notifications for any delays or issues.",
    },
    {
      question: "How long does implementation take?",
      answer:
        "Most customers are fully operational within 24-48 hours. Our implementation team provides personalized onboarding and training to ensure your team can start benefiting from OmniWTMS immediately. For larger enterprises with custom needs, our implementation specialists create a tailored timeline.",
    },
    {
      question: "Can OmniWTMS integrate with my existing business software?",
      answer:
        "OmniWTMS is built with integration in mind. We offer seamless connections with popular accounting software, e-commerce platforms, CRM systems, and more. Our API is also available for custom integrations with your proprietary systems.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer 24/7 support via chat, email, and phone. Our UK-based support team consists of logistics experts who understand your business needs. FleetMaster and Titan plans include a dedicated account manager for personalized assistance.",
    },
    {
      question: "How does OmniWTMS handle delivery proof and documentation?",
      answer:
        "Our mobile app allows drivers to capture electronic signatures, photos, barcodes, and notes upon delivery. All documentation is instantly uploaded to the cloud and linked to the appropriate order, providing a complete audit trail and real-time delivery confirmation for you and your customers.",
    },
    {
      question: "Is there a contract or can I pay month-to-month?",
      answer:
        "We offer flexible payment options. You can choose monthly payments with no long-term commitment, or save with our annual plans. There are no hidden fees or cancellation penalties—we believe in earning your business every month.",
    },
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-600">
            Everything you need to know about OmniWTMS and how it can transform
            your logistics operations.
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-gray-800 hover:text-blue-600 py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Still have questions?{" "}
            <a
              href="#contact"
              className="text-blue-600 font-medium hover:underline"
            >
              Contact our team
            </a>{" "}
            for more information.
          </p>
        </div>
      </div>
    </section>
  );
}
