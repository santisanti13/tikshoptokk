import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";


const links = [
  { label: "Servicios", href: "#servicios" },
  { label: "Product Research", href: "/product-research" },
  { label: "Contenido IA", href: "/contenido-ia" },
  { label: "Productos", href: "/productos" },
  { label: "Blog", href: "/blog" },
  { label: "Proceso", href: "#proceso" },
  { label: "Resultados", href: "#resultados" },
];

const NavItem = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
  const location = useLocation();
  const isInternal = href.startsWith("/");
  const className = "text-sm text-muted-foreground transition-colors hover:text-foreground";
  if (isInternal) return <Link to={href} className={className} onClick={onClick}>{label}</Link>;
  const target = location.pathname === "/" ? href : `/${href}`;
  return <a href={target} className={className} onClick={onClick}>{label}</a>;
};

const Logo = () => (
  <span className="flex items-baseline gap-2 tracking-tight">
    <span className="font-display text-xl font-bold">
      <span className="text-primary">Tik</span>
      <span className="text-secondary">Shop</span>
      <span className="text-foreground">Tok</span>
    </span>
    <span className="font-['Playfair_Display',serif] text-lg italic text-muted-foreground">
      agency
    </span>
  </span>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const accountLink = signedIn
    ? { href: "/mi-cuenta", label: "Mi cuenta" }
    : { href: "/login", label: "Acceder" };


  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-background/70 px-5 py-2.5 backdrop-blur-xl">
        {location.pathname === "/" ? (
          <a href="#"><Logo /></a>
        ) : (
          <Link to="/"><Logo /></Link>
        )}

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <NavItem key={l.href} href={l.href} label={l.label} />
          ))}
          <NavItem href={accountLink.href} label={accountLink.label} />
          <Button asChild size="sm" className="rounded-full px-5">
            <a href={location.pathname === "/" ? "#contacto" : "/#contacto"}>Agenda una consulta</a>
          </Button>
        </div>


        <button
          className="lg:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-white/10 bg-background/95 px-5 py-4 backdrop-blur-xl lg:hidden">
          {links.map((l) => (
            <div key={l.href} className="block py-2.5">
              <NavItem href={l.href} label={l.label} onClick={() => setOpen(false)} />
            </div>
          ))}
          <div className="block py-2.5">
            <NavItem href={accountLink.href} label={accountLink.label} onClick={() => setOpen(false)} />
          </div>

          <Button asChild size="sm" className="mt-3 w-full rounded-full">
            <a href={location.pathname === "/" ? "#contacto" : "/#contacto"} onClick={() => setOpen(false)}>
              Agenda una consulta
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
