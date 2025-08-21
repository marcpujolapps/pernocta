/* eslint-disable @next/next/no-img-element */
"use client";
import { ExternalLink, Shield, Search, PiggyBank } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PlatformLogos() {
  const [isVisible, setIsVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false]);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay animation to start after search section completes (1600ms + 1000ms + 200ms buffer)
          setTimeout(() => setIsVisible(true), 2800);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardsRef.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setTimeout(() => {
                setCardsVisible(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }, index * 200); // Stagger animation by 200ms
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    cardsRef.current.forEach(card => {
      if (card) cardObserver.observe(card);
    });

    return () => cardObserver.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-muted/30 z-20">
      <div className="max-w-6xl mx-auto text-center">
        <div className={`bg-gradient-to-br from-background via-background to-muted/20 rounded-2xl p-8 border border-border/50 shadow-lg backdrop-blur-sm transition-all duration-1000 ease-out delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Per què utilitzar Pernocta.cat?
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              ref={el => { cardsRef.current[0] = el; }}
              className={`group flex flex-col items-center text-center p-6 rounded-xl bg-card/50 border border-border/30 hover:bg-card/80 hover:shadow-md transition-all duration-500 ${
                cardsVisible[0] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-3 text-lg">
                100% Legal
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Tots els allotjaments estan inscrits al registre de turisme de Catalunya
              </p>
            </div>
            <div 
              ref={el => { cardsRef.current[1] = el; }}
              className={`group flex flex-col items-center text-center p-6 rounded-xl bg-card/50 border border-border/30 hover:bg-card/80 hover:shadow-md transition-all duration-500 ${
                cardsVisible[1] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-3 text-lg">
                Tot en Un Lloc
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                No necessites buscar a múltiples plataformes, aquí els trobaràs tots.
              </p>
            </div>
            <div 
              ref={el => { cardsRef.current[2] = el; }}
              className={`group flex flex-col items-center text-center p-6 rounded-xl bg-card/50 border border-border/30 hover:bg-card/80 hover:shadow-md transition-all duration-500 ${
                cardsVisible[2] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                <PiggyBank className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-foreground mb-3 text-lg">
                Servei Gratuït
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                No cobrem cap comissió, només et redirigim al web del propietari o a una plataforma existent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
