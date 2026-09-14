import { defineTool } from "@lovable.dev/mcp-js";

const overview = {
  brand: "TikShopTok",
  positioning:
    "Agencia nativa de TikTok Shop y social commerce: product research, creación de marcas, gestión de creadores UGC y lanzamiento de productos virales.",
  services: [
    "Product research: detección de productos virales y validación de demanda en TikTok Shop.",
    "Creación de marcas listas para operar en TikTok Shop.",
    "Conexión y gestión de creadores UGC, incluidos creadores top de España.",
    "Adaptación de la propuesta de valor de producto desde otros marketplaces a TikTok Shop.",
  ],
  results: [
    "Miles de euros en facturación generada para marcas.",
    "Más de 5 millones de visitas en contenido con producto a la venta.",
    "Más de 30 productos seleccionados y lanzados en más de 10 categorías.",
    "Colaboraciones con creadores top 1 de España.",
  ],
  links: {
    site: "https://tikshoptok.com",
    productResearch: "https://tikshoptok.com/product-research",
    blog: "https://tikshoptok.com/blog",
  },
};

export default defineTool({
  name: "get_agency_overview",
  title: "Get agency overview",
  description:
    "Get TikShopTok's positioning, services, headline results and key site links. Useful context before answering questions about the agency.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(overview, null, 2) }],
      structuredContent: overview,
    };
  },
});
