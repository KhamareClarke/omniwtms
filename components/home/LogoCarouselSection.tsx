'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function LogoCarouselSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // List of client/media logos
  const logos = [
    {
      name: 'The Guardian',
      imagePath: '/images/logos/guardian-logo.svg',
      width: 160,
      height: 40
    },
    {
      name: 'Forbes',
      imagePath: '/images/logos/forbes-logo.svg',
      width: 120, 
      height: 40
    },
    {
      name: 'Tech Crunch',
      imagePath: '/images/logos/techcrunch-logo.svg',
      width: 180,
      height: 40
    },
    {
      name: 'Financial Times',
      imagePath: '/images/logos/ft-logo.svg',
      width: 100,
      height: 40
    },
    {
      name: 'BBC Business',
      imagePath: '/images/logos/bbc-logo.svg',
      width: 100,
      height: 40
    },
    {
      name: 'DPD',
      imagePath: '/images/logos/dpd-logo.svg',
      width: 100,
      height: 40
    },
    {
      name: 'Royal Mail',
      imagePath: '/images/logos/royal-mail-logo.svg',
      width: 140,
      height: 40
    },
    {
      name: 'Hermes',
      imagePath: '/images/logos/hermes-logo.svg',
      width: 130,
      height: 40
    }
  ];

  // Client logos
  const clients = [
    {
      name: 'Smart Shipping Co.',
      imagePath: '/images/logos/client-logo1.svg',
      width: 140,
      height: 40
    },
    {
      name: 'FastTrack Delivery',
      imagePath: '/images/logos/client-logo2.svg',
      width: 150,
      height: 40
    },
    {
      name: 'Global Logistics',
      imagePath: '/images/logos/client-logo3.svg',
      width: 160,
      height: 40
    },
    {
      name: 'Speedy Freight',
      imagePath: '/images/logos/client-logo4.svg',
      width: 130,
      height: 40
    },
    {
      name: 'Metro Couriers',
      imagePath: '/images/logos/client-logo5.svg',
      width: 140,
      height: 40
    },
    {
      name: 'City Express',
      imagePath: '/images/logos/client-logo6.svg',
      width: 130,
      height: 40
    }
  ];

  useEffect(() => {
    // Fallback for when images don't load
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.src = `https://via.placeholder.com/160x40?text=${encodeURIComponent(img.alt || 'Logo')}`;
    };

    // Add error handlers to all images
    const images = containerRef.current?.querySelectorAll('img');
    images?.forEach(img => {
      img.addEventListener('error', handleImageError);
    });

    return () => {
      images?.forEach(img => {
        img.removeEventListener('error', handleImageError);
      });
    };
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">As Featured In</h2>
          <div className="h-1 w-16 sm:w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Media logos carousel */}
        <div className="relative overflow-hidden mb-8 sm:mb-12">
          <div className="flex animate-marquee">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-4 sm:mx-8 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="h-[30px] sm:h-[40px] relative" style={{ width: `${Math.round(logo.width * 0.8)}px`, maxWidth: '120px', minWidth: '80px' }}>
                  <Image
                    src={logo.imagePath}
                    alt={logo.name}
                    width={logo.width}
                    height={logo.height}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/${Math.round(logo.width * 0.8)}x${logo.height}?text=${encodeURIComponent(logo.name)}`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-16 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Trusted By</h2>
          <div className="h-1 w-16 sm:w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Client logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-slow">
            {[...clients, ...clients].map((client, index) => (
              <div key={index} className="flex-shrink-0 mx-4 sm:mx-8">
                <div className="h-[30px] sm:h-[40px] relative" style={{ width: `${Math.round(client.width * 0.8)}px`, maxWidth: '120px', minWidth: '80px' }}>
                  <Image
                    src={client.imagePath}
                    alt={client.name}
                    width={client.width}
                    height={client.height}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/${Math.round(client.width * 0.8)}x${client.height}?text=${encodeURIComponent(client.name)}`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
