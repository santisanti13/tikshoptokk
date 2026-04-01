import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Servicios", href: "#servicios" },
  { label: "Product Research", href: "/product-research" },
  { label: "Blog", href: "/blog" },
  { label: "Proceso", href: "#proceso" },
  { label: "Por qué nosotros", href: "#porqué" },
  { label: "Resultados", href: "#resultados" },
];

const NavItem = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
  const isInternal = href.startsWith("/");
  const className = "text-sm text-muted-foreground transition-colors hover:text-foreground";

  if (isInternal) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const logoTo = location.pathname === "/" ? "#" : "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {location.pathname === "/" ? (
          <a href="#" className="font-display text-xl font-bold tracking-tight">
            <span className="text-primary">Tik</span>
            <span className="text-secondary">Shop</span>
            <span className="text-foreground">Tok</span>
          </a>
        ) : (
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            <span className="text-primary">Tik</span>
            <span className="text-secondary">Shop</span>
            <span className="text-foreground">Tok</span>
          </Link>
        )}

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavItem key={l.href} href={l.href} label={l.label} />
          ))}
          <Button asChild size="sm">
            <a href="#contacto">Agenda una consulta</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
          {links.map((l) => (
            <div key={l.href} className="block py-3">
              <NavItem href={l.href} label={l.label} onClick={() => setOpen(false)} />
            </div>
          ))}
          <Button asChild size="sm" className="mt-2 w-full">
            <a href="#contacto" onClick={() => setOpen(false)}>
              Agenda una consulta
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
