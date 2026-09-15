// Reglas por categoría para no arriesgar la cuenta de TikTok Shop.
// Se añaden al guion antes de generar y a los textos del carrusel.

type Rule = { match: RegExp; label: string; rules: string; disclaimer?: string };

const RULES: Rule[] = [
  {
    match:
      /suplement|vitamin|colágen|colagen|probiót|probiot|salud|adelgaz|detox|inmun|dolor|sueño|melatonin|omega|creatin|proteín|protein/i,
    label: "salud y suplementos",
    rules:
      "Prohibido cualquier lenguaje médico o terapéutico: nada de curar, tratar, aliviar, prevenir, diagnosticar, ni resultados garantizados, ni cifras de pérdida de peso, ni menciones a enfermedades. Habla solo de hábitos y sensaciones personales.",
    disclaimer: "Complemento alimenticio. No sustituye una dieta variada ni un estilo de vida saludable.",
  },
  {
    match: /cosm|sérum|serum|crema|piel|acné|acne|arruga|pelo|cabello|maquillaje|retinol|ácido|acido hialur/i,
    label: "cosmética",
    rules:
      "Nada de promesas clínicas ni de eliminar arrugas, acné o manchas. Habla de textura, sensación y rutina, siempre en primera persona y como experiencia propia.",
    disclaimer: "Resultados personales; pueden variar según la piel.",
  },
  {
    match: /niñ|bebé|bebe|infantil|juguete/i,
    label: "infantil",
    rules: "Nada de afirmaciones de seguridad absolutas ni de desarrollo cognitivo. Menciona el uso siempre con supervisión adulta.",
  },
  {
    match: /electrónic|electronic|batería|bateria|cargador|freidora|aspirador|electrodom/i,
    label: "electrónica y electrodomésticos",
    rules: "No inventes potencias, autonomías, certificaciones ni consumos. Si un dato no está en la ficha del producto, no lo menciones.",
  },
];

export function complianceFor(text: string | null | undefined): Rule | null {
  const value = (text ?? "").trim();
  if (!value) return null;
  return RULES.find((r) => r.match.test(value)) ?? null;
}

/** Bloque de reglas para añadir al prompt. */
export function complianceBlock(text: string | null | undefined): string {
  const rule = complianceFor(text);
  if (!rule) return "";
  return (
    `Reglas obligatorias de categoría (${rule.label}): ${rule.rules}` +
    (rule.disclaimer ? ` Incluye al final del texto publicable este aviso literal: “${rule.disclaimer}”.` : "")
  );
}

export function complianceDisclaimer(text: string | null | undefined): string | null {
  return complianceFor(text)?.disclaimer ?? null;
}
