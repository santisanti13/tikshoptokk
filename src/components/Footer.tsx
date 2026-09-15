import { Link } from "react-router-dom";
import { LOCALIDADES } from "@/data/localidades";

const Footer = () => (
  <footer className="px-4 py-10 md:px-8">
    <div className="bento mx-auto max-w-7xl p-6 md:p-8">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <a href="/" className="font-display text-lg font-bold tracking-tight">
          <span className="text-primary">Tik</span>
          <span className="text-secondary">Shop</span>
          <span className="text-foreground">Tok</span>
        </a>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="/#servicios" className="transition-colors hover:text-foreground">Servicios</a>
          <a href="/product-research" className="transition-colors hover:text-foreground">Product Research</a>
          <a href="/blog" className="transition-colors hover:text-foreground">Blog</a>
          <a href="/#resultados" className="transition-colors hover:text-foreground">Resultados</a>
          <a href="/#contacto" className="transition-colors hover:text-foreground">Contacto</a>
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TikShopTok</p>
      </div>

      <nav aria-label="Agencia por ciudad" className="mt-8 border-t border-white/[0.06] pt-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Agencia de TikTok Shop por ciudad</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-start">
          {LOCALIDADES.map((l) => (
            <li key={l.slug}>
              <Link to={`/agencia-tiktok-shop/${l.slug}`} className="transition-colors hover:text-foreground">
                {l.ciudad}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Equipo con base en el centro de Valencia. Trabajamos con marcas de toda España.</p>
      </nav>
    </div>
  </footer>
);

export default Footer;
