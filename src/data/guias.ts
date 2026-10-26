export interface Guia {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  secciones: { h2: string; parrafos: string[]; lista?: string[] }[];
  faqs: { q: string; a: string }[];
}

export const GUIAS: Guia[] = [
  {
    slug: "como-vender-en-tiktok-shop-espana",
    title: "Cómo vender en TikTok Shop España: guía paso a paso",
    h1: "Cómo vender en TikTok Shop España",
    description: "Guía práctica para vender en TikTok Shop España: requisitos, alta en Seller Center, catálogo, contenido, creadores afiliados y LIVE.",
    intro: "TikTok Shop permite vender sin que el usuario salga de la app: desde un vídeo, un LIVE o la pestaña Tienda. Esta guía resume los pasos que seguimos con las marcas que llevamos.",
    secciones: [
      {
        h2: "1. Requisitos antes de empezar",
        parrafos: ["Necesitas una empresa o autónomo dado de alta en España, documentación fiscal, una cuenta bancaria a nombre del negocio y productos permitidos por las políticas de TikTok Shop."],
        lista: ["CIF/NIF y documentación de la sociedad o autónomo", "Cuenta bancaria del titular", "Productos fuera de categorías restringidas", "Capacidad logística para cumplir plazos de envío"],
      },
      {
        h2: "2. Alta en TikTok Shop Seller Center",
        parrafos: ["El registro se hace en Seller Center. Tras verificar la identidad y el negocio, configuras almacén, métodos de envío y devoluciones. Las condiciones y comisiones vigentes las publica TikTok en Seller Center y pueden cambiar, revísalas allí antes de fijar precios."],
      },
      {
        h2: "3. Catálogo que convierte",
        parrafos: ["Las fichas con fotos limpias, título claro, variantes bien definidas y precio competitivo convierten mejor. Elige pocos productos héroe con un beneficio que se pueda demostrar en vídeo en los primeros segundos."],
      },
      {
        h2: "4. Contenido y creadores afiliados",
        parrafos: ["En TikTok Shop la venta nace del contenido. Combina vídeos de la propia marca con creadores afiliados que cobran comisión por venta. Envía muestras, da guiones con ganchos y mide qué creador vende, no solo qué vídeo tiene visitas."],
      },
      {
        h2: "5. LIVE y escalado",
        parrafos: ["Cuando tienes vídeos que venden, los LIVE con ofertas limitadas y la publicidad sobre los vídeos ganadores aceleran el crecimiento. Consulta qué vende hoy en España en nuestro ranking diario."],
      },
    ],
    faqs: [
      { q: "¿Se puede vender en TikTok Shop desde España?", a: "Sí. TikTok Shop está disponible en España para vendedores registrados en Seller Center que cumplan los requisitos de negocio y de producto." },
      { q: "¿Necesito muchos seguidores para vender?", a: "No. Las ventas pueden venir de vídeos de creadores afiliados y de la pestaña Tienda, aunque tu cuenta sea nueva." },
      { q: "¿Cuánto cobra TikTok Shop?", a: "TikTok aplica una comisión por venta que publica en Seller Center y que puede variar por categoría y promociones. Revísala allí antes de calcular márgenes." },
    ],
  },
  {
    slug: "comisiones-tiktok-shop",
    title: "Comisiones de TikTok Shop: qué costes calcular antes de vender",
    h1: "Comisiones de TikTok Shop: qué costes tener en cuenta",
    description: "Qué costes debes calcular para vender rentable en TikTok Shop: comisión de plataforma, comisión de creadores afiliados, envío, muestras y publicidad.",
    intro: "Para que un producto sea rentable en TikTok Shop no basta con la comisión de la plataforma. Estos son todos los costes que metemos en la calculadora de margen de cada marca.",
    secciones: [
      {
        h2: "Comisión de la plataforma",
        parrafos: ["TikTok cobra un porcentaje sobre cada venta. El importe exacto y las promociones para vendedores nuevos se consultan en Seller Center, porque cambian con el tiempo y según la categoría."],
      },
      {
        h2: "Comisión de creadores afiliados",
        parrafos: ["Tú decides qué porcentaje pagas a los creadores que venden tu producto. Una comisión atractiva atrae más creadores; hay que equilibrarla con tu margen."],
      },
      {
        h2: "Otros costes que se olvidan",
        parrafos: ["Además de las comisiones, suma estos costes por unidad vendida:"],
        lista: ["Envío y embalaje", "Muestras gratuitas para creadores", "Devoluciones", "Publicidad para impulsar vídeos ganadores", "Descuentos y cupones de campaña"],
      },
      {
        h2: "Cómo calcular el margen",
        parrafos: ["Margen = precio de venta − coste del producto − comisión de plataforma − comisión de afiliado − envío − parte proporcional de muestras y publicidad. Si el resultado no deja margen con la comisión de afiliado que necesitas, ajusta precio o pack."],
      },
    ],
    faqs: [
      { q: "¿Las comisiones de TikTok Shop son fijas?", a: "No. Dependen de la categoría y de las campañas vigentes. La referencia oficial es Seller Center." },
      { q: "¿Qué comisión doy a los creadores?", a: "La que permita tu margen y sea competitiva frente a productos similares. Conviene probar y subir en campañas clave." },
    ],
  },
  {
    slug: "como-ser-afiliado-tiktok-shop",
    title: "Cómo ser afiliado de TikTok Shop y ganar comisiones",
    h1: "Cómo ser creador afiliado de TikTok Shop",
    description: "Cómo funciona el programa de afiliados de TikTok Shop en España: requisitos, cómo elegir productos, pedir muestras y crear vídeos que venden.",
    intro: "Los creadores afiliados enlazan productos de TikTok Shop en sus vídeos y LIVE y cobran una comisión por cada venta. Así funciona y así trabajamos con creadores desde TikShopTok.",
    secciones: [
      {
        h2: "Requisitos",
        parrafos: ["TikTok fija requisitos mínimos de edad, seguidores y cumplimiento de normas para acceder a las herramientas de afiliado. Los requisitos actuales aparecen en la app, en el apartado de TikTok Shop para creadores."],
      },
      {
        h2: "Elegir qué productos promocionar",
        parrafos: ["Elige productos que encajen con tu audiencia y que se puedan demostrar en vídeo. Mira qué está funcionando en España en nuestro ranking diario antes de pedir muestras."],
      },
      {
        h2: "Vídeos que venden",
        parrafos: ["Gancho en los primeros segundos, demostración real del producto, beneficio claro y llamada a la acción hacia el carrito. Etiqueta siempre el contenido patrocinado o generado con IA según las normas de TikTok."],
      },
      {
        h2: "Trabajar con marcas",
        parrafos: ["En TikShopTok conectamos creadores con marcas que venden en TikTok Shop: muestras, briefing y comisiones acordadas. Escríbenos si quieres formar parte de la red."],
      },
    ],
    faqs: [
      { q: "¿Cuánto gana un afiliado de TikTok Shop?", a: "Depende de la comisión que ofrezca cada marca y de las ventas que generen tus vídeos. No hay un sueldo fijo." },
      { q: "¿Puedo pedir muestras gratis?", a: "Sí, muchas marcas envían muestras a creadores afiliados a través de TikTok Shop si tu perfil encaja." },
    ],
  },
];

export const getGuia = (slug?: string) => GUIAS.find((g) => g.slug === slug);
