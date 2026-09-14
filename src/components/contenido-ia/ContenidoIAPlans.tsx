import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, TrendingUp, Rocket, ShoppingBag, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Plan = {
  name: string;
  price: string;
  note: string;
  features: string[];
  highlight?: boolean;
};

type Line = {
  id: string;
  icon: typeof TrendingUp;
  eyebrow: string;
  title: string;
  description: string;
  accent: "primary" | "secondary";
  plans: Plan[];
};

const lines: Line[] = [
  {
    id: "escalar-cuentas",
    icon: TrendingUp,
    eyebrow: "Línea 1",
    title: "Escalar cuentas de TikTok Shop ya creadas",
    description:
      "Ya tienes cuenta y ventas: metemos contenido IA a diario, testeamos hooks y multiplicamos el alcance del catálogo.",
    accent: "primary",
    plans: [
      {
        name: "Boost",
        price: "690 €/mes",
        note: "Para validar el canal",
        features: [
          "20 vídeos IA al mes",
          "1 avatar y voz de marca",
          "Guiones y subtítulos incluidos",
          "Publicación en 1 cuenta",
          "Informe mensual de rendimiento",
        ],
      },
      {
        name: "Escala",
        price: "1.490 €/mes",
        note: "El más contratado",
        highlight: true,
        features: [
          "60 vídeos al mes",
          "2 avatares y 2 formatos",
          "Test de hooks semanal",
          "Optimización de fichas y links de afiliado",
          "Informe quincenal + llamada",
        ],
      },
      {
        name: "Dominio",
        price: "2.900 €/mes + 5% ventas",
        note: "Máximo volumen",
        features: [
          "120–150 vídeos al mes",
          "Hasta 3 cuentas en paralelo",
          "Formatos listos para directos",
          "Gestión de comentarios y creadores afiliados",
          "Llamada semanal de estrategia",
        ],
      },
    ],
  },
  {
    id: "cuentas-sinteticas",
    icon: Rocket,
    eyebrow: "Línea 2",
    title: "Crear, lanzar y escalar cuentas sintéticas",
    description:
      "Construimos el personaje con IA desde cero, lo lanzamos y lo escalamos hasta monetizar con TikTok Shop.",
    accent: "secondary",
    plans: [
      {
        name: "Lanzadera",
        price: "1.200 € pago único",
        note: "30 días, cuenta entregada lista",
        features: [
          "Creación del personaje: identidad, voz y estilo",
          "30 vídeos de lanzamiento",
          "Calendario editorial del primer mes",
          "Publicación gestionada 30 días",
          "Manual para seguir tú solo",
        ],
      },
      {
        name: "Growth",
        price: "1.900 €/mes",
        note: "Mínimo 3 meses",
        highlight: true,
        features: [
          "1 cuenta nueva gestionada de principio a fin",
          "60 vídeos al mes",
          "Monetización con TikTok Shop afiliado",
          "Objetivos de seguidores y GMV por trimestre",
          "La cuenta es tuya siempre",
        ],
      },
      {
        name: "Portfolio",
        price: "4.500 €/mes",
        note: "O fijo menor + 70/30 de ingresos",
        features: [
          "3 cuentas en nichos distintos",
          "150+ vídeos al mes",
          "Diversificación de riesgo por nicho",
          "Cuadro de mando de resultados",
          "Reparto de ingresos opcional",
        ],
      },
    ],
  },
  {
    id: "ecommerce-diario",
    icon: ShoppingBag,
    eyebrow: "Línea 3",
    title: "Ecommerce con contenido diario en su perfil",
    description:
      "Vendes en TikTok Shop y necesitas publicar todos los días: nosotros producimos, publicamos y medimos.",
    accent: "primary",
    plans: [
      {
        name: "Diario Lite",
        price: "890 €/mes",
        note: "1 vídeo al día",
        features: [
          "30 vídeos al mes con tu producto",
          "Publicación en tu perfil",
          "Guiones orientados a venta",
          "Subtítulos y música en tendencia",
        ],
      },
      {
        name: "Diario Pro",
        price: "1.690 €/mes",
        note: "2 vídeos al día",
        highlight: true,
        features: [
          "60 vídeos al mes",
          "2 formatos: avatar + producto en mano",
          "Pack de creatividades para anuncios",
          "Reporte de rendimiento y aprendizajes",
        ],
      },
      {
        name: "Full Commerce",
        price: "3.200 €/mes",
        note: "Perfil gestionado al completo",
        features: [
          "3 vídeos al día",
          "Gestión completa del perfil",
          "4 vídeos con creadores reales al mes",
          "Embudo hacia ficha de producto",
          "Seguimiento de ventas atribuidas",
        ],
      },
    ],
  },
  {
    id: "divulgacion",
    icon: Megaphone,
    eyebrow: "Línea 4",
    title: "Empresas de divulgación y entretenimiento",
    description:
      "Convertimos tu conocimiento o tu marca en contenido serializado, multiplataforma y multilingüe.",
    accent: "secondary",
    plans: [
      {
        name: "Marca Personal",
        price: "750 €/mes",
        note: "Presencia constante",
        features: [
          "16 vídeos al mes con avatar de marca",
          "Adaptación a TikTok, Reels y Shorts",
          "Guiones de divulgación",
        ],
      },
      {
        name: "Autoridad",
        price: "1.550 €/mes",
        note: "Volumen y alcance",
        highlight: true,
        features: [
          "40 vídeos al mes",
          "Formato explicativo + entretenimiento",
          "Traducción a 2 idiomas",
          "Calendario editorial mensual",
        ],
      },
      {
        name: "Media House",
        price: "3.500 €/mes",
        note: "Como un medio propio",
        features: [
          "90 vídeos al mes en 2 canales",
          "Clonación de voz del portavoz",
          "Series y formatos recurrentes",
          "Distribución multiplataforma",
        ],
      },
    ],
  },
];

const extras = [
  { label: "Avatar propio a partir de tu equipo", price: "450 € único" },
  { label: "Clonación de voz", price: "250 €" },
  { label: "Idioma adicional", price: "+20%" },
  { label: "Auditoría inicial de cuenta", price: "250 € (se descuenta al contratar)" },
];

/** Precio de pago online de cada plan (los IDs viven en el proveedor de pagos). */
const PLAN_PRICES: Record<string, string> = {
  Boost: "ag_boost_monthly",
  Escala: "ag_escala_monthly",
  Dominio: "ag_dominio_monthly",
  Lanzadera: "ag_lanzadera_onetime",
  Growth: "ag_growth_monthly",
  Portfolio: "ag_portfolio_monthly",
  "Diario Lite": "ag_diario_lite_monthly",
  "Diario Pro": "ag_diario_pro_monthly",
  "Full Commerce": "ag_full_commerce_monthly",
  "Marca Personal": "ag_marca_personal_monthly",
  Autoridad: "ag_autoridad_monthly",
  "Media House": "ag_media_house_monthly",
};

const ContenidoIAPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkout, setCheckout] = useState<{ priceId: string; label: string } | null>(null);

  const goToContact = () => {
    navigate("/");
    setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const contratar = async (plan: Plan) => {
    const priceId = PLAN_PRICES[plan.name];
    if (!priceId || !paymentsConfigured()) {
      goToContact();
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast({
        title: "Crea tu cuenta para contratar",
        description: "Necesitamos una cuenta para asociar el plan y darte acceso al panel.",
      });
      navigate("/login?next=/contenido-ia");
      return;
    }
    setCheckout({ priceId, label: `${plan.name} · ${plan.price}` });
  };

  return (
    <section id="planes" className="px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Planes y precios</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            Cuatro formas de <span className="gradient-text">producir sin límite</span>, tres niveles cada una
          </h2>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Precios sin IVA. Todos los planes incluyen guiones, edición, subtítulos y calendario de
            publicación. Sin permanencia salvo donde se indica.
          </p>
        </motion.div>

        <div className="space-y-20">
          {lines.map((line) => {
            const isPink = line.accent === "primary";
            return (
              <div key={line.id} id={line.id} className="scroll-mt-28">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
                >
                  <div>
                    <div className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] ${isPink ? "text-primary" : "text-secondary"}`}>
                      <line.icon className="h-4 w-4" /> {line.eyebrow}
                    </div>
                    <h3 className="mt-3 max-w-2xl font-display text-2xl font-bold md:text-3xl">{line.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{line.description}</p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {line.plans.map((plan, i) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={`${plan.highlight ? "bento-solid" : "bento"} ${isPink ? "bento-hover-pink" : "bento-hover-cyan"} relative flex flex-col overflow-hidden p-7`}
                    >
                      {plan.highlight && (
                        <div className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${isPink ? "border-primary/30 bg-primary/10 text-primary" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                          <Star className="h-3 w-3" /> Recomendado
                        </div>
                      )}
                      <h4 className="font-display text-xl font-bold">{plan.name}</h4>
                      <p className={`mt-3 font-display text-3xl font-bold tracking-tight ${isPink ? "text-primary" : "text-secondary"}`}>
                        {plan.price}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{plan.note}</p>
                      <ul className="mt-6 space-y-2.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPink ? "text-primary" : "text-secondary"}`} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={goToContact}
                        variant={plan.highlight ? "default" : "outline"}
                        className={`mt-7 w-full rounded-full ${plan.highlight ? "glow-pink" : "border-white/20 bg-transparent hover:bg-white/5"}`}
                      >
                        Contratar {plan.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bento mt-20 p-8 md:p-10"
        >
          <h3 className="font-display text-2xl font-bold">Extras para cualquier plan</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {extras.map((e) => (
              <div key={e.label} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 p-4">
                <span className="text-sm">{e.label}</span>
                <span className="shrink-0 text-sm font-medium text-secondary">{e.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContenidoIAPlans;
