import React, { useState, useEffect, useCallback } from 'react';
import type { Offer } from '@shared/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@components/Icons';

interface HeroBannerProps {
  offers: Offer[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ offers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (offers.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex === offers.length - 1 ? 0 : prevIndex + 1));
    }
  }, [offers.length]);

  const prevSlide = () => {
    if (offers.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? offers.length - 1 : prevIndex - 1));
    }
  };

  useEffect(() => {
    if (offers.length > 1) {
      const slideInterval = setInterval(nextSlide, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [offers.length, nextSlide]);
  
  if (!offers || offers.length === 0) {
      return (
          <div className="container mx-auto px-4 py-6">
              <div className="bg-gray-200 animate-pulse w-full h-48 md:h-64 lg:h-80 rounded-lg"></div>
          </div>
      );
  }

  return (
    <div className="relative w-full overflow-hidden container mx-auto px-4 py-6">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {offers.map((offer) => (
          <div key={offer.id} className="w-full flex-shrink-0">
            <img src={offer.imageUrl} alt={offer.title} className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg shadow-lg" />
          </div>
        ))}
      </div>

      {offers.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition text-gray-800 shadow-md">
              <ChevronLeftIcon />
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition text-gray-800 shadow-md">
              <ChevronRightIcon />
            </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {offers.map((_, index) => (
              <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${index + 1}`}
              ></button>
          ))}
      </div>
    </div>
  );
};

export default HeroBanner;
