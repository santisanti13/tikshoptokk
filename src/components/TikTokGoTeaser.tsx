import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const TikTokGoTeaser = () => (
  <section className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
    <div className="neon-blob-pink -left-24 top-10 opacity-40 pointer-events-none absolute" />
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-card/60 p-8 md:p-12">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Nuevo · Próximamente en España
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
            TikTok Go: el comercio local <span className="gradient-text">llega a TikTok</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Restaurantes, hoteles y experiencias promocionados por creadores de su ciudad, a comisión. Aún no está
            disponible en España, pero estamos preparando a negocios y creadores para el día del lanzamiento.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/tiktok-go">
                Quiero llegar preparado <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-background/60 p-5">
            <Store className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-display font-semibold">Para negocios locales</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ficha, contenido y oferta listos para vender desde la primera semana del programa.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-background/60 p-5">
            <Users className="mt-1 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <h3 className="font-display font-semibold">Para creadores</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Una nueva vía de ingresos promocionando los negocios de tu zona, sin audiencias gigantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TikTokGoTeaser;
