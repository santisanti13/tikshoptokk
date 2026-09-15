// Estilos de carrusel para TikTok Shop. Cada estilo define cuántas láminas
// tiene, cómo debe verse cada imagen y cómo se escribe el texto que ponemos
// encima (el texto lo compone la web, nunca la IA, para que siempre se lea).

export type CarouselStyle = {
  id: string;
  label: string;
  hint: string;
  slides: number;
  /** Guía visual para las imágenes generadas. */
  visual: string;
  /** Guía de redacción de los textos de cada lámina. */
  copy: string;
};

export const CAROUSEL_STYLES: CarouselStyle[] = [
  {
    id: "prueba-pantalla",
    label: "Prueba en pantalla",
    hint: "Foto real del producto + dato duro en cada lámina.",
    slides: 4,
    visual:
      "Foto realista de móvil del producto en un entorno doméstico real, luz natural, sin texto ni marcas de agua. Cada lámina cambia el ángulo o el momento de uso, manteniendo el producto exactamente igual.",
    copy:
      "Lámina 1: gancho corto con el beneficio más concreto. Láminas 2 y 3: un dato verificable cada una (precio, medida, duración, material). Última lámina: llamada a la acción hacia la tarjeta del producto.",
  },
  {
    id: "antes-despues",
    label: "Antes / después",
    hint: "Comparativa del problema y el resultado.",
    slides: 4,
    visual:
      "Fotos realistas de móvil que muestran primero la situación problemática sin el producto y después la situación resuelta con el producto presente. Sin texto en la imagen, sin collages.",
    copy:
      "Lámina 1: el problema en primera persona. Lámina 2: qué probaste antes y no funcionó. Lámina 3: el cambio con el producto, sin exagerar. Lámina 4: cierre con llamada a la acción.",
  },
  {
    id: "top3",
    label: "Consejos (top 3)",
    hint: "Dos consejos útiles y el tercero es tu producto.",
    slides: 4,
    visual:
      "Fotos realistas de móvil del contexto de cada consejo; en la penúltima y la última aparece el producto de forma clara. Sin texto en la imagen.",
    copy:
      "Lámina 1: promesa del listado. Láminas 2 y 3: un consejo útil de verdad cada una, sin mencionar el producto. Lámina 4: el producto como tercer consejo, con llamada a la acción.",
  },
  {
    id: "meme-chat",
    label: "Meme y chat",
    hint: "Escena social reconocible y conversación.",
    slides: 4,
    visual:
      "Fotos realistas y algo cotidianas de una escena social reconocible relacionada con el problema del producto, más una lámina con el producto en la mano. Sin texto en la imagen.",
    copy:
      "Tono de humor cercano y reconocible. Lámina 1: la situación incómoda. Láminas 2 y 3: la conversación que lleva al producto. Lámina 4: cierre con llamada a la acción.",
  },
  {
    id: "oferta",
    label: "Oferta directa",
    hint: "Qué es, qué resuelve y por qué hoy.",
    slides: 4,
    visual:
      "Fotos limpias del producto en casa, cercanas y bien iluminadas, con detalle de textura y acabado. Sin texto en la imagen.",
    copy:
      "Lámina 1: qué es y para quién. Lámina 2: qué resuelve. Lámina 3: por qué merece la pena ahora (sin inventar descuentos). Lámina 4: llamada a la acción.",
  },
  {
    id: "storytime",
    label: "Storytime",
    hint: "Primera persona, el cómo se retiene al final.",
    slides: 5,
    visual:
      "Fotos realistas de móvil que acompañan un relato en primera persona, con el producto apareciendo a partir de la tercera lámina. Sin texto en la imagen.",
    copy:
      "Relato en primera persona. Lámina 1: el resultado ya conseguido como gancho. Láminas intermedias: el recorrido. Última lámina: el cómo y la llamada a la acción.",
  },
];

export const getCarouselStyle = (id?: string | null): CarouselStyle | null =>
  CAROUSEL_STYLES.find((s) => s.id === id) ?? null;

/** Coste fijo en tokens de un carrusel completo. */
export const CAROUSEL_TOKENS = 3;
