import {
  Shield,
  Globe,
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const platform = [
    { name: "Warehouse Management", link: "/warehouse-management" },
    { name: "Route Optimization", link: "/route-optimization" },
    { name: "Inventory Control", link: "/inventory-control" },
    { name: "Fleet Management", link: "/fleet-management" },
    { name: "Driver Mobile App", link: "/driver-mobile-app" },
    { name: "AI Forecasting", link: "/ai-forecasting" },
  ];

  const company = [
    { name: "About Us", link: "/about" },
    { name: "Case Studies", link: "/case-studies" },
    { name: "Contact Us", link: "/contact" },
    { name: "Book a Demo", link: "/book-a-demo" },
    { name: "Terms & Privacy", link: "/legal" },
  ];

  const contactInfo = [
    { icon: Phone, info: "+44 20 7946 0982", link: "tel:+442079460982" },
    {
      icon: Mail,
      info: "sales@omniwtms.com",
      link: "mailto:sales@omniwtms.com",
    },
    {
      icon: MapPin,
      info: "45 Liverpool St, London EC2M 7QN",
      link: "https://maps.google.com/?q=45+Liverpool+St+London",
    },
    { icon: Clock, info: "Mon-Fri: 9am - 5:30pm GMT", link: null },
  ];

  const trustBadges = [
    { icon: Shield, label: "UK-Based Support" },
    { icon: Globe, label: "ISO 27001 Certified" },
    { icon: Check, label: "GDPR Compliant" },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900 py-16 shadow-inner border-t border-blue-100">
      <div className="container mx-auto px-3 xs:px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">
          {/* Left Column - Logo and Description */}
          <div className="mb-8 md:mb-0 max-w-full md:max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/omniwtmslogo.png"
                alt="OmniWTMS Logo"
                width={56}
                height={56}
                className="w-14 h-14 rounded-md shadow-lg border border-blue-100 bg-white object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 text-transparent bg-clip-text animate-gradient-slow drop-shadow">
                OmniWTMS
              </span>
            </div>

            <p className="text-gray-700 mb-6 font-medium">
              Total logistics command from warehouse to wheels. Over 250 UK
              logistics operations run on OmniWTMS. Full visibility, total
              control.
            </p>
            <div className="flex gap-4 mt-4">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <span
                    key={index}
                    className="flex items-center gap-2 text-blue-700 bg-blue-100 rounded-full px-3 py-1 text-xs font-semibold shadow-sm mr-2 mb-2"
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Middle Columns - Navigation */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-0">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Platform
              </h3>
              <ul className="space-y-2">
                {platform.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      className="text-blue-800 hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Company
              </h3>
              <ul className="space-y-2">
                {company.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      className="text-blue-800 hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="max-w-full md:max-w-xs mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-400" />
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-blue-700 hover:text-blue-900 font-medium transition-colors"
                      >
                        {item.info}
                      </a>
                    ) : (
                      <span className="text-blue-700 font-medium">
                        {item.info}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 mb-10">
          <a
            href="https://calendly.com/khamareclarke/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:scale-105 transition-transform text-base"
          >
            From Pallet to Doorstep
          </a>
          <a
            href="/brochure.pdf"
            target="_blank"
            className="px-6 py-3 rounded-full border-2 border-blue-600 text-blue-700 font-bold bg-white shadow hover:bg-blue-50 hover:text-blue-900 transition-colors text-base"
          >
            Download Brochure
          </a>
        </div>

        {/* Social and Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-blue-100 pt-6 mt-2 gap-4">
          <div className="flex gap-6 mb-6 md:mb-0">
            <a
              href="https://linkedin.com/company/omniwtms"
              className="text-blue-600 hover:text-blue-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/omniwtms"
              className="text-blue-600 hover:text-blue-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a
              href="https://facebook.com/omniwtms"
              className="text-blue-600 hover:text-blue-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} OmniWTMS Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
