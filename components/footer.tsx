import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Shield } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-primary mb-4">
              Pernocta.cat
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              El metabuscador de confiança per trobar tots els allotjaments
              legals de Catalunya. Verificats oficialment per la Generalitat.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-secondary" />
              <span>Verificació oficial</span>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">
              Destinacions populars
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/results?location=Barcelona"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Barcelona
                </Link>
              </li>
              <li>
                <Link
                  href="/results?location=Costa Brava"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Costa Brava
                </Link>
              </li>
              <li>
                <Link
                  href="/results?location=Costa Daurada"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Costa Daurada
                </Link>
              </li>
              <li>
                <Link
                  href="/results?location=Pirineus"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pirineus
                </Link>
              </li>
              <li>
                <Link
                  href="/results?location=Val d'Aran"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Val d&apos;Aran
                </Link>
              </li>
              <li>
                <Link
                  href="/results?location=Terres de l'Ebre"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terres de l&apos;Ebre
                </Link>
              </li>
            </ul>
          </div>

          {/* Accommodation Types */}
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">
              Tipus d&apos;allotjament
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/results?type=casa-rural"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cases rurals
                </Link>
              </li>
              <li>
                <Link
                  href="/results?type=apartament"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Apartaments turístics
                </Link>
              </li>
              <li>
                <Link
                  href="/results?type=hotel"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hotels
                </Link>
              </li>
              <li>
                <Link
                  href="/results?type=camping"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Càmpings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Suport</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/com-funciona"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Com funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/ajuda"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Centre d&apos;ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/contacte"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacte
                </Link>
              </li>
              <li>
                <Link
                  href="/propietaris"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Per a propietaris
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Platform Integration */}
        <div className="mb-8">
          <h4 className="font-semibold text-card-foreground mb-4 text-center">
            Tenim els allotjaments de totes les plataformes
          </h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>Airbnb</span>
            <span>•</span>
            <span>Booking.com</span>
            <span>•</span>
            <span>Escapada Rural</span>
            <span>•</span>
            <span>Club Rural</span>
            <span>•</span>
            <span>Hotels.com</span>
            <span>•</span>
            <span>Expedia</span>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Legal and Contact */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Barcelona, Catalunya</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@pernocta.cat</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/privacitat"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacitat
            </Link>
            <Link
              href="/termes"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termes d&apos;ús
            </Link>
            <Link
              href="/cookies"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            © {new Date().getFullYear()} Pernocta.cat. Tots els drets reservats.
          </p>
        </div>
      </div>
    </footer>
  );
}
