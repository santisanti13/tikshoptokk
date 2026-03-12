const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
      <a href="#" className="font-display text-lg font-bold tracking-tight">
        <span className="text-primary">Tik</span>
        <span className="text-secondary">Shop</span>
        <span className="text-foreground">Tok</span>
      </a>

      <div className="flex gap-8 text-sm text-muted-foreground">
        <a href="#servicios" className="transition-colors hover:text-foreground">Servicios</a>
        <a href="#proceso" className="transition-colors hover:text-foreground">Proceso</a>
        <a href="#resultados" className="transition-colors hover:text-foreground">Resultados</a>
        <a href="#contacto" className="transition-colors hover:text-foreground">Contacto</a>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} TikShopTok. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
