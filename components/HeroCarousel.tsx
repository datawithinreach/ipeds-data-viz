'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const slides = [
  {
    src: '/DJI_0482.jpg',
    alt: 'University campus aerial view at sunset',
  },
  {
    src: '/Drone_Alumni_Full_2000x1333.jpg',
    alt: 'University stadium packed on game day',
  },
  {
    src: '/download.jpeg',
    alt: 'University campus aerial overview',
  },
];

const INTERVAL = 6000; // ms between slides
const TRANSITION = 800; // ms for the slide animation

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), TRANSITION);
    },
    [current, isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <header className="relative h-[600px] overflow-hidden lg:h-[680px]">
      {/* Image strip — slides horizontally */}
      <div
        className="absolute inset-0 flex"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(current * 100) / slides.length}%)`,
          transition: `transform ${TRANSITION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className="relative h-full"
            style={{ width: `${100 / slides.length}%` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              style={{
                transform: current === i ? 'scale(1.05)' : 'scale(1)',
                transition: `transform ${INTERVAL}ms ease-out`,
              }}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,41,59,0.92), rgba(30,41,59,0.7), rgba(30,41,59,0.55))' }} />
      <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: 'linear-gradient(to top, rgba(30,41,59,0.65), transparent)' }} />

      {/* Text content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            Higher Education
            <span className="mt-2 block text-3xl drop-shadow-md" style={{ color: '#5eead4' }}>
              Data
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Explore
            comprehensive data on enrollment trends, graduation outcomes,
            student demographics, and financial metrics for higher education
            institutions across the United States.
          </p>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group relative h-2.5 overflow-hidden rounded-full transition-all duration-500"
            style={{ width: current === i ? 40 : 10 }}
          >
            <span className="absolute inset-0 rounded-full bg-white/40" />
            {current === i && (
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#0d9488' }}
                style={{
                  animation: `fillBar ${INTERVAL}ms linear`,
                }}
              />
            )}
            {current !== i && (
              <span className="absolute inset-0 rounded-full bg-white/40 transition-colors group-hover:bg-white/70" />
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fillBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
}
