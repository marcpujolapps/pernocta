/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const [titleVisible, setTitleVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          setTimeout(() => setDescriptionVisible(true), 200);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const logos = [
    { src: "platforms/airbnb.png", alt: "Airbnb" },
    { src: "platforms/booking.png", alt: "Booking" },
    { src: "platforms/escapada_rural.png", alt: "Escapada Rural" },
    { src: "platforms/club_rural.png", alt: "Club Rural" },
    { src: "platforms/homeaway.png", alt: "HomeAway" },
    { src: "platforms/tripadvisor.png", alt: "TripAdvisor" },
    { src: "platforms/expedia.png", alt: "Expedia" },
    { src: "platforms/hotels.png", alt: "Hotels.com" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-br from-card to-background pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 leading-tight px-2 transition-all duration-700 ease-out ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          Tots els allotjaments de Catalunya, en un únic lloc
        </h1>

        <div
          className={`mb-6 sm:mb-8 md:mb-10 px-2 transition-all duration-700 ease-out delay-200 ${
            descriptionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed">
            Tenim <b>tots</b> els allotjaments que tenen les altres plataformes,{" "}
            <b>menys els il·legals sense llicència.</b>
          </p>

          {/* Infinite Carousel for all screen sizes */}
          <div className="overflow-hidden relative max-w-4xl mx-auto">
            <style jsx>{`
              @keyframes infiniteScroll {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(calc(-100px * 8 - 2rem * 8));
                }
              }
              .scroll-container {
                display: flex;
                animation: infiniteScroll 30s linear infinite;
              }
              .scroll-container:hover {
                animation-play-state: paused;
              }
              .scroll-container > img {
                margin-right: 2rem;
              }
              @media (max-width: 640px) {
                @keyframes infiniteScroll {
                  from {
                    transform: translateX(0);
                  }
                  to {
                    transform: translateX(calc(-80px * 8 - 1.5rem * 8));
                  }
                }
                .scroll-container > img {
                  margin-right: 1.5rem;
                }
              }
            `}</style>
            <div className="scroll-container">
              {/* Triple set for seamless loop */}
              {[...Array(3)].map((_, setIndex) =>
                logos.map((logo, index) => (
                  <img
                    key={`${setIndex}-${index}`}
                    src={logo.src}
                    alt={logo.alt}
                    className="w-20 h-7 sm:w-24 sm:h-8 md:w-28 md:h-9 object-contain flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}