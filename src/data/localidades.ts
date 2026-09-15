// Páginas locales de la agencia. Cada ciudad tiene contenido propio: nada de
// texto repetido cambiando el nombre de la ciudad.

export interface Localidad {
  slug: string;
  ciudad: string;
  provincia: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Por qué esta ciudad, en nuestras palabras: enfoque, no estadísticas inventadas. */
  contexto: string[];
  /** Categorías de producto en las que ponemos el foco al trabajar en esa zona. */
  foco: string[];
  /** Cómo trabajamos con una marca de esa ciudad, paso a paso. */
  comoTrabajamos: { titulo: string; texto: string }[];
  faqs: { q: string; a: string }[];
}

export const BASE_CIUDAD = "Valencia";

export const LOCALIDADES: Localidad[] = [
  {
    slug: "valencia",
    ciudad: "Valencia",
    provincia: "Valencia",
    title: "Agencia de TikTok Shop en Valencia | TikShopTok",
    description:
      "Agencia de TikTok Shop con base en el centro de Valencia: creamos y escalamos cuentas de venta, gestionamos tu tienda y conectamos tu marca con creadores. Rodajes presenciales en Valencia.",
    h1: "Agencia de TikTok Shop en Valencia",
    intro:
      "Trabajamos desde el centro de Valencia. Es la única ciudad en la que grabamos, montamos y revisamos contenido en persona el mismo día, así que si tu marca está aquí el proceso es más rápido: vemos el producto, decidimos el ángulo de venta y salimos con las piezas del mes grabadas.",
    contexto: [
      "Somos una agencia valenciana, no una delegación: la operativa diaria de cuentas, feed y creadores se lleva desde aquí.",
      "Al estar en la misma ciudad podemos recoger muestras de producto, grabar en tu almacén o tienda y devolverte el contenido editado sin envíos por medio.",
      "Para marcas de fuera de Valencia trabajamos igual en remoto: el producto viaja, no el equipo.",
    ],
    foco: ["Moda y complementos", "Cosmética y cuidado personal", "Hogar y menaje", "Suplementación y bienestar"],
    comoTrabajamos: [
      {
        titulo: "Visita y revisión de producto",
        texto: "Vemos el producto en persona, medimos qué se entiende en cámara y qué hay que explicar sí o sí para que no haya devoluciones.",
      },
      {
        titulo: "Cuenta y tienda listas para vender",
        texto: "Abrimos o auditamos la cuenta de venta, ordenamos el catálogo, las fichas y el feed para que TikTok Shop lo apruebe sin bloqueos.",
      },
      {
        titulo: "Contenido diario",
        texto: "Grabamos en Valencia o generamos piezas con nuestro estudio de UGC con IA, y publicamos todos los días con seguimiento de qué gancho funciona.",
      },
      {
        titulo: "Creadores y afiliados",
        texto: "Ponemos el producto en manos de creadores de nuestra red y montamos la comisión de afiliado para que vendan por ti.",
      },
    ],
    faqs: [
      {
        q: "¿Tenéis oficina abierta al público en Valencia?",
        a: "Trabajamos desde el centro de Valencia, pero no es una tienda: las visitas y los rodajes se acuerdan por cita.",
      },
      {
        q: "¿Podéis grabar en mi almacén o tienda de Valencia?",
        a: "Sí, es lo habitual cuando la marca está en la ciudad. Grabamos donde esté el producto y editamos nosotros.",
      },
    ],
  },
  {
    slug: "madrid",
    ciudad: "Madrid",
    provincia: "Madrid",
    title: "Agencia de TikTok Shop en Madrid | TikShopTok",
    description:
      "Agencia de TikTok Shop para marcas de Madrid: lanzamos cuentas de venta, gestionamos tienda y feed y conectamos tu producto con creadores madrileños. Operativa 100% en remoto.",
    h1: "Agencia de TikTok Shop en Madrid",
    intro:
      "Madrid concentra la mayor parte de las marcas de ecommerce y de las agencias de creadores de España, y eso cambia la estrategia: el problema aquí no es encontrar creadores, es que tu producto destaque entre marcas que ya llevan meses publicando a diario.",
    contexto: [
      "Con marcas de Madrid trabajamos en remoto de principio a fin: tú envías el producto, nosotros devolvemos las piezas y la cuenta funcionando.",
      "En una plaza saturada priorizamos volumen y variedad de ganchos: muchas piezas al mes, probando ángulos distintos, en vez de una campaña grande al trimestre.",
      "Si ya trabajas con una agencia de medios en Madrid, nos encargamos solo de la parte orgánica y de TikTok Shop sin pisar su trabajo.",
    ],
    foco: ["Cosmética y skincare", "Suplementación", "Tecnología y gadgets", "Moda"],
    comoTrabajamos: [
      {
        titulo: "Auditoría de la cuenta actual",
        texto: "Revisamos qué se ha publicado, qué se vendió y qué está frenando la tienda antes de tocar nada.",
      },
      {
        titulo: "Cuenta de venta o cuenta de contenido",
        texto: "Decidimos si te conviene vender desde una cuenta de marca o levantar cuentas de contenido que alimenten la tienda.",
      },
      {
        titulo: "Producción constante",
        texto: "Contenido diario, con creadores reales o con nuestro estudio de UGC con IA cuando hace falta volumen rápido.",
      },
      {
        titulo: "Afiliados que ya venden",
        texto: "Activamos creadores de nuestra red con comisión, para que el producto se mueva sin depender solo de tu cuenta.",
      },
    ],
    faqs: [
      {
        q: "¿Hace falta que estéis en Madrid para trabajar con vosotros?",
        a: "No. Toda la operativa es en remoto y el producto se envía a nuestro equipo; los rodajes presenciales los hacemos en Valencia.",
      },
      {
        q: "¿Trabajáis con marcas que ya venden mucho en Madrid?",
        a: "Sí, y en ese caso solemos entrar por la parte de creadores y afiliados, que es donde más margen de crecimiento suele quedar.",
      },
    ],
  },
  {
    slug: "barcelona",
    ciudad: "Barcelona",
    provincia: "Barcelona",
    title: "Agencia de TikTok Shop en Barcelona | TikShopTok",
    description:
      "Agencia de TikTok Shop para marcas de Barcelona: cuentas de venta, gestión de tienda y feed, contenido diario y red de creadores. Trabajo en remoto con envío de producto.",
    h1: "Agencia de TikTok Shop en Barcelona",
    intro:
      "Barcelona tiene mucha marca con diseño y mucho producto pensado para exportar. Ahí el reto suele ser otro: la marca cuida tanto la imagen que el contenido acaba pareciendo publicidad, y en TikTok Shop lo que vende es que parezca una persona contándolo en su casa.",
    contexto: [
      "Con marcas catalanas trabajamos en remoto y en castellano; si tu público es catalanoparlante adaptamos el guion y la voz del contenido.",
      "Traducimos la identidad de marca a un formato que no parezca anuncio: mismo producto, tono de creador.",
      "Si vendes también fuera de España, preparamos versiones del contenido en otro idioma sobre la misma pieza.",
    ],
    foco: ["Moda y diseño", "Cosmética natural", "Hogar y decoración", "Deporte"],
    comoTrabajamos: [
      {
        titulo: "Traducción de marca a formato TikTok",
        texto: "Cogemos tu manual de marca y decidimos qué se mantiene y qué se relaja para que el contenido no parezca un spot.",
      },
      {
        titulo: "Tienda y fichas de producto",
        texto: "Dejamos el catálogo, las fichas y el feed listos para que TikTok Shop empuje el producto y no lo bloquee.",
      },
      {
        titulo: "Contenido y variantes por idioma",
        texto: "Publicamos a diario y, si vendes fuera, generamos la misma pieza en otro idioma con nuestro estudio de IA.",
      },
      {
        titulo: "Creadores afines a la marca",
        texto: "Seleccionamos creadores cuyo estilo encaja con tu imagen, no solo por número de seguidores.",
      },
    ],
    faqs: [
      {
        q: "¿Podéis hacer el contenido en catalán?",
        a: "Sí, podemos generar la misma pieza en catalán además del castellano, con coste de idioma adicional.",
      },
      {
        q: "¿Cómo os enviamos el producto desde Barcelona?",
        a: "Con un envío normal a nuestro equipo en Valencia. A partir de ahí grabamos y publicamos sin que tengas que moverte.",
      },
    ],
  },
  {
    slug: "sevilla",
    ciudad: "Sevilla",
    provincia: "Sevilla",
    title: "Agencia de TikTok Shop en Sevilla | TikShopTok",
    description:
      "Agencia de TikTok Shop para marcas y creadores de Sevilla y Andalucía: montamos la cuenta de venta, gestionamos la tienda y activamos afiliados. Todo en remoto.",
    h1: "Agencia de TikTok Shop en Sevilla",
    intro:
      "En Sevilla y en Andalucía nos encontramos muchas marcas pequeñas con producto muy bueno y poca estructura digital: venden bien en tienda física o por WhatsApp y no han dado el salto a TikTok Shop. Ese es el caso que mejor se nos da, porque partimos de cero y hacemos las cosas bien desde el principio.",
    contexto: [
      "Montamos la cuenta de venta desde cero: alta, verificación, catálogo y primeras piezas, sin que tengas que entender el panel de TikTok.",
      "Trabajamos en remoto con marcas andaluzas; solo necesitamos el producto y los datos reales de lo que vendes.",
      "Si eres creador y quieres vivir de las comisiones de afiliado, también montamos y escalamos tu cuenta.",
    ],
    foco: ["Alimentación y gourmet", "Moda flamenca y artesanía", "Cosmética", "Hogar"],
    comoTrabajamos: [
      {
        titulo: "Alta y verificación de la tienda",
        texto: "Nos ocupamos del alta en TikTok Shop, la verificación y el catálogo, que es donde casi todo el mundo se atasca.",
      },
      {
        titulo: "Primeras piezas y precio de salida",
        texto: "Definimos qué producto sale primero, a qué precio y con qué gancho, para no quemar el catálogo entero de golpe.",
      },
      {
        titulo: "Publicación diaria",
        texto: "Contenido todos los días, grabado o generado con IA, con revisión semanal de qué se vende.",
      },
      {
        titulo: "Afiliados andaluces",
        texto: "Activamos creadores con comisión para que tu producto llegue a públicos que tu cuenta todavía no toca.",
      },
    ],
    faqs: [
      {
        q: "No he vendido nunca en TikTok Shop, ¿podéis empezar de cero?",
        a: "Sí, es lo más habitual: nos encargamos del alta, la verificación, el catálogo y las primeras piezas.",
      },
      {
        q: "¿Trabajáis con creadores de Sevilla que quieran ser afiliados?",
        a: "Sí. Montamos la cuenta, elegimos productos con comisión y la escalamos con contenido diario.",
      },
    ],
  },
];

export const getLocalidad = (slug?: string) => LOCALIDADES.find((l) => l.slug === slug);
