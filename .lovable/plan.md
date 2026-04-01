

## Plan: Blog con Sanity CMS + 3 Posts sobre TikTok Shop

### Resumen
Crear un proyecto en Sanity CMS, definir un schema de blog, publicar 3 artículos sobre TikTok Shop (basados en búsqueda de tendencias actuales), y añadir una sección de blog a la web.

### Paso 1: Crear proyecto Sanity y schema
- Crear un nuevo proyecto Sanity con dataset "production"
- Desplegar schema con tipo `post` (title, slug, publishedAt, excerpt, body, mainImage, category, tags)
- Añadir CORS origin para la URL de Lovable

### Paso 2: Investigar contenido trending
- Buscar en la web los temas más visitados y mejor posicionados sobre TikTok Shop, UGC, estrategias de venta, etc.
- Usar esa información para redactar 3 posts relevantes y actualizados

### Paso 3: Crear 3 posts en Sanity
Temas propuestos (se ajustarán según la investigación):
1. **Guía completa de TikTok Shop 2025-2026** — Cómo funciona, cómo empezar, mejores prácticas
2. **UGC y TikTok Shop: La fórmula viral** — Cómo usar contenido generado por usuarios para vender
3. **Top productos virales en TikTok Shop** — Categorías ganadoras y tendencias actuales

### Paso 4: Instalar dependencias e integrar Sanity
- Instalar `@sanity/client` y `@sanity/image-url`
- Crear cliente Sanity en `src/lib/sanity.ts`

### Paso 5: Crear páginas de blog
- **`/blog`** — Listado de posts con imagen, título, extracto, fecha y categoría. Diseño dark theme consistente con el sitio
- **`/blog/:slug`** — Página individual del post con contenido completo
- Añadir ruta "Blog" al Navbar

### Paso 6: Componentes UI
- `BlogCard` — Tarjeta de preview del post
- `BlogList` — Grid de tarjetas
- `BlogPost` — Vista completa del artículo

### Detalle técnico
- Queries GROQ para obtener posts desde Sanity
- `@tanstack/react-query` para data fetching (ya disponible en el proyecto)
- Renderizado de rich text del body con portable text o markdown
- Responsive design con Tailwind, manteniendo el tema oscuro actual (primary rosa, secondary cyan)

