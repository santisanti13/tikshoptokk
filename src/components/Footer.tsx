const Footer = () => (
  <footer className="px-4 py-10 md:px-8">
    <div className="bento mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 p-6 md:flex-row md:p-8">
      <a href="#" className="font-display text-lg font-bold tracking-tight">
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

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} TikShopTok
      </p>
    </div>
  </footer>
);

export default Footer;
