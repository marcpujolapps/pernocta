/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const [titleVisible, setTitleVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [logosVisible, setLogosVisible] = useState(Array(8).fill(false));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the animations
          setTimeout(() => setTitleVisible(true), 200);
          setTimeout(() => setDescriptionVisible(true), 600);
          // Animate logos one by one with 80ms difference
          setTimeout(() => {
            logosVisible.forEach((_, index) => {
              setTimeout(() => {
                setLogosVisible(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * 80);
            });
          }, 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [logosVisible]);

  const logos = [
    { src: "platforms/airbnb.png", alt: "Airbnb" },
    { src: "platforms/booking.png", alt: "Booking" },
    { src: "platforms/escapada_rural.png", alt: "Escapada Rural" },
    { src: "platforms/club_rural.png", alt: "Club Rural" },
    { src: "platforms/homeaway.png", alt: "HomeAway" },
    { src: "platforms/tripadvisor.png", alt: "TripAdvisor" },
    { src: "platforms/expedia.png", alt: "Expedia" },
    { src: "platforms/hotels.png", alt: "Hotels.com" }
  ];

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-card to-background pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 leading-tight px-2 transition-all duration-1000 ease-out ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          Tots els allotjaments de Catalunya, en un únic lloc
        </h1>

        <div className={`mb-6 sm:mb-8 md:mb-10 px-2 transition-all duration-1000 ease-out delay-300 ${
          descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed">
            Tenim <b>tots</b> els allotjaments que tenen les altres plataformes, <b>menys els il·legals sense llicència.</b>
          </p>
          {/* Mobile: Infinite Slider */}
          <div className={`sm:hidden mb-8 mt-4 overflow-hidden relative ${
            descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <style jsx>{`
              @keyframes infiniteScroll {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(calc(-80px * 8 - 2rem * 8));
                }
              }
              .scroll-container {
                display: flex;
                animation: infiniteScroll 25s linear infinite;
              }
              .scroll-container > img {
                margin-right: 2rem;
              }
            `}</style>
            <div className="scroll-container">
              {/* First set of logos */}
              {logos.map((logo, index) => (
                <img
                  key={`first-${index}`}
                  src={logo.src}
                  alt={logo.alt}
                  className="w-20 h-7 object-contain flex-shrink-0"
                />
              ))}
              {/* Duplicate set for seamless loop */}
              {logos.map((logo, index) => (
                <img
                  key={`second-${index}`}
                  src={logo.src}
                  alt={logo.alt}
                  className="w-20 h-7 object-contain flex-shrink-0"
                />
              ))}
              {/* Third set to ensure no gaps */}
              {logos.map((logo, index) => (
                <img
                  key={`third-${index}`}
                  src={logo.src}
                  alt={logo.alt}
                  className="w-20 h-7 object-contain flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Desktop: Static Grid */}
          <div className={`hidden sm:flex sm:flex-wrap justify-center items-center gap-2 md:gap-6 text-sm max-w-4xl mx-auto ${
            descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {logos.map((logo, index) => (
              <img
                key={index}
                src={logo.src}
                alt={logo.alt}
                className={`w-20 h-7 md:w-24 md:h-8 object-contain hover:scale-110 transition-all duration-500 mx-auto ${
                  logosVisible[index] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
              />
            ))}
          </div>
        </div>

        {/* <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Descobreix cases rurals, apartaments turístics, hotels i càmpings
          verificats oficialment.{" "}
          <strong className="text-foreground">
            El mateix preu, la màxima confiança.
          </strong>
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Tota Catalunya</span>
          </div>
          <div className="flex items-center gap-2">
            <House className="w-5 h-5 text-primary" />
            <span>113.666 allotjaments</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Verificació oficial</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-10 py-4 h-auto" asChild>
            <a href="/results">Començar cerca</a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-10 py-4 h-auto bg-transparent"
          >
            Com funciona
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              Pernocta.cat no és un portal de reserves.
            </strong>{" "}
            Comparem i et dirigim al millor preu disponible.
          </p>
        </div> */}
      </div>
    </section>
  );
}