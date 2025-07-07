'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { id: 1, image: '/home1.webp' },
  { id: 2, image: '/home2.webp' },
  { id: 3, image: '/home3.webp' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    resetInterval();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    resetInterval();
  };

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startInterval();
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform scale-105',
            index === current
              ? 'opacity-100 scale-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          )}
        >
          <Image
            src={slide.image}
            alt={`Slide ${slide.id}`}
            fill
            className="object-cover"
            priority={index === current}
          />
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/60 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6 text-black" />
      </button>
    </div>
  );
}
