/** Bloque de datos cerrados del producto (puntos ciegos) para el prompt. */
export const blindSpotsBlock = (fill: string | null | undefined): string => {
  const text = (fill ?? "").trim();
  if (!text) return "";
  return (
    "Datos cerrados del producto (respétalos literalmente, no los inventes ni los cambies): " +
    text.replace(/\s*\n\s*/g, " ") +
    " Si algo del producto no aparece en estos datos ni en las imágenes, no lo muestres."
  );
};
