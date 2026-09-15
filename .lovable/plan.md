# Rediseño: landing de agencia + SaaS aparte + acceso simplificado

## 1. Landing de agencia (home)

Reordenar la home para que en 10 segundos se entienda quién eres, qué haces y con quién trabajas:

1. **Apertura** — "Agencia de TikTok Shop" con una frase clara y dos botones: hablar con el equipo / ver el estudio de contenido.
2. **Resultados en cifras** — más de 100.000 productos vendidos con marcas, más de 1,2 millones facturados en un año con creadores, alrededor de 200.000 € de beneficio neto, más de 150 productos lanzados.
3. **Marcas y creadores** — franja con las marcas (Medicube, Aldous Bio, MIKOMIKA) y los creadores afiliados (@belinda, @diegoxu, @raquel_twin), con la nota de que los top GMV facturan entre 50.000 € y 150.000 € al mes desde su cuenta.
4. **Servicios** — cuatro bloques:
   - Creación de cuentas de contenido
   - Creación de cuentas de venta (afiliados y tiendas)
   - Gestión de tienda: feed, páginas de producto y catálogo
   - Red de influencers y afiliados
5. **Ventajas** — por qué la agencia (nativos de TikTok Shop, creadores propios, producción diaria, product research).
6. **Muestras de contenido real** — se mantiene el carrusel de vídeos que ya existe, sin cambios de contenido.
7. **Proceso y contacto** — se conservan.

## 2. Bloque puente al SaaS

Al final de la home, un bloque con tono propio (mismo branding, más producto y menos agencia) que presenta el estudio de contenido para quien quiere hacérselo él mismo, con enlace a su página.

## 3. Página del SaaS

La página del estudio de contenido pasa a tener su propia apertura orientada a autoservicio: qué es, qué puedes hacer tú solo, planes y precios, y un acceso directo a probarlo. Mantiene la tipografía y los colores de marca pero con un lenguaje más de producto.

## 4. Acceso separado

Hoy hay una sola pantalla de acceso que hace de todo. Se separa en dos entradas claras:

- **Cliente de agencia** — entra a su zona de cliente: plan contratado, facturas, renovación.
- **Usuario del estudio** — entra al estudio de contenido.

Cada entrada es una pantalla simple: Google arriba, correo y contraseña debajo, y un enlace para recuperar la contraseña. El menú superior muestra "Entrar" con esas dos opciones en vez de la pantalla mezclada de ahora.

## Detalles técnicos

- `Hero.tsx`, `Services.tsx`, `WhyUs.tsx`: reescritura de contenido y jerarquía; nuevos componentes `BrandsMarquee.tsx` (marcas y creadores) y `SaasBridge.tsx` (puente al SaaS), insertados en `src/pages/Index.tsx`. `VideoShowcase`, `Process`, `Testimonials`, `Contact`, `Footer` sin cambios de contenido.
- `ContenidoIAHero.tsx`: nuevo encabezado de producto; `ContenidoIAPlans.tsx` sin cambios de lógica de pago.
- `Login.tsx`: acepta un parámetro de destino (`agency` | `studio`) que decide el texto, el logo y el redirect por defecto (`/mi-cuenta` o `/ugc-studio`). Se mantienen `signInWithOAuth` de Google, correo/contraseña y recuperación; sin tocar RequireAuth ni el flujo de tokens.
- `Navbar.tsx`: menú "Entrar" con las dos rutas, y enlace destacado al estudio.
- Todo con tokens semánticos existentes (`index.css`), sin colores nuevos ni hardcodeados. Verificación responsive con Playwright a 375 y 1280.

Las cifras y los nombres de marcas/creadores son los que me has dado; si alguno no debe aparecer públicamente, dímelo y lo quito.
