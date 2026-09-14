// Puntos ciegos del producto: lo que una foto o un vídeo no muestran y el
// modelo de vídeo tiende a inventarse (color del forro, densidad del material,
// qué hay dentro…). Cada preset añade una línea a la ficha del producto y se
// envía al modelo como dato cerrado: "esto es así, no lo inventes".

export type BlindSpot = {
  id: string;
  label: string;
  /** Plantilla que se inserta en la ficha; el usuario rellena los corchetes. */
  template: string;
};

export const BLIND_SPOTS: BlindSpot[] = [
  { id: "interior", label: "Color del interior", template: "Interior / forro: color [describe] y acabado [mate o brillante]." },
  { id: "material", label: "Material y densidad", template: "Material: [tejido/plástico/metal], densidad [rígido, semirrígido o blando]." },
  { id: "textura", label: "Textura al tacto", template: "Textura al tacto: [suave, rugosa, gomosa, aterciopelada]." },
  { id: "apertura", label: "Cómo se abre", template: "Se abre así: [cremallera, tapa a rosca, clic, imán] y por [dónde]." },
  { id: "dentro", label: "Qué hay dentro", template: "Dentro se ve: [compartimentos, bolsas, accesorios incluidos]." },
  { id: "tamano", label: "Tamaño y peso real", template: "Tamaño real: [medidas] y peso [kg]; comparado con [objeto conocido]." },
  { id: "acabado", label: "Acabado y brillo", template: "Acabado exterior: [mate, satinado, brillante] y [con o sin reflejos]." },
  { id: "color-exacto", label: "Color exacto", template: "Color exacto: [nombre y tono]; NO aparece en [colores prohibidos]." },
  { id: "movimiento", label: "Cómo se mueve / cae", template: "Al moverse: [cae rígido, fluye, rebota, mantiene la forma]." },
  { id: "sonido", label: "Sonido al usarlo", template: "Sonido al usarlo: [clic seco, zumbido suave, silencioso]." },
  { id: "liquido", label: "Textura del contenido", template: "Contenido: [líquido ligero, gel, crema densa, polvo], color [tono]." },
  { id: "pantalla", label: "Pantalla o luces", template: "Pantalla / luces: [qué muestra] con luz [color] cuando [cuándo]." },
];

export const blindSpotsBlock = (fill: string | null | undefined): string => {
  const text = (fill ?? "").trim();
  if (!text) return "";
  return (
    "Datos cerrados del producto (respétalos literalmente, no los inventes ni los cambies): " +
    text.replace(/\s*\n\s*/g, " ") +
    " Si algo del producto no aparece en estos datos ni en las imágenes, no lo muestres."
  );
};
