/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { Ban, ShieldCheck, } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [logosVisible, setLogosVisible] = useState(Array(8).fill(false));
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-card to-background pt-24 pb-6 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* <Badge
          variant="secondary"
          className="mb-6 text-sm font-medium px-4 py-2"
        >
          <ShieldCheck className="w-5 h-5 mr-2" />
          Tots els allotjaments amb llicència oficial
        </Badge>
        <Badge
          variant="destructive"
          className="mb-6 ml-4 text-sm font-medium px-4 py-2"
        >
          <Ban className="w-5 h-5 mr-2" />
          Cap allotjament il·legal
        </Badge> */}

        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight transition-all duration-1000 ease-out ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          Tots els allotjaments de Catalunya, en un únic lloc
        </h1>

        <div className={`mb-6 transition-all duration-1000 ease-out delay-300 ${
          descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-lg text-muted-foreground mb-4">
            Tenim <b>tots</b> els allotjaments que tenen les altres plataformes, <b>menys els il·legals sense llicència.</b>
          </p>
          <div className={`flex flex-wrap justify-center gap-6 text-sm ${
            descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <img
              src="platforms/airbnb.png"
              alt="Airbnb"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[0] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
             <img
              src="platforms/booking.png"
              alt="Booking"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[1] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/escapada_rural.png"
              alt="Escapada Rural"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[2] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/club_rural.png"
              alt="Club Rural"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[3] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/homeaway.png"
              alt="HomeAway"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[4] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/tripadvisor.png"
              alt="TripAdvisor"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[5] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/expedia.png"
              alt="Expedia"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[6] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
            <img
              src="platforms/hotels.png"
              alt="Hotels.com"
              className={`w-24 h-8 object-contain hover:scale-110 transition-all duration-500 ${
                logosVisible[7] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            />
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
