// Control de normas de TikTok Shop antes de generar.
// Se usa igual en el estudio (aviso en pantalla) y en el servidor.
// Solo se bloquea lo que TikTok prohíbe de raíz (categorías vetadas y suplantar
// a una persona real). Todo lo demás avisa y se corrige en el propio guion:
// generar vídeos siempre tiene que ser posible.

export type PolicyIssue = {
  id: string;
  level: "block" | "warn";
  title: string;
  fix: string;
};

type Rule = PolicyIssue & { match: RegExp };

const RULES: Rule[] = [
  {
    id: "medico",
    level: "warn",
    match:
      /\bcur(a|ar|ación|an)\b|\btrata\b|tratamiento (de|para)|\benfermedad|cáncer|diabetes|hipertens|ansiedad|depresión|insomnio|elimina (el|la|las|los) (dolor|grasa|arrugas|acné)|pierde \d+\s*(kg|kilos)|adelgaza \d+|milagro|resultados garantizados|garantiza(do|mos)?\b/i,
    title: "Promesa médica o resultado garantizado",
    fix: "Habla de tu experiencia y de hábitos («lo uso cada mañana»), sin curar, tratar, eliminar ni garantizar resultados.",
  },
  {
    id: "categoria-prohibida",
    level: "block",
    match:
      /\barma\b|munición|tabaco|vape|vapeo|cigarr|nicotina|alcohol|cerveza|vodka|whisky|casino|apuesta|cripto|bitcoin|dinero rápido|ganar dinero desde casa|cannabis|\bcbd\b|medicamento|receta médica|adelgazante milagroso|producto sanitario/i,
    title: "Categoría no permitida en TikTok Shop",
    fix: "Ese tipo de producto o promesa no se puede promocionar. Cambia el producto o el enfoque del guion.",
  },
  {
    id: "fuera-de-plataforma",
    level: "warn",
    match:
      /whatsapp|telegram|escríbeme al dm|dm para comprar|link en (la )?bio|compra en mi web|mi página web|paypal|bizum|transferencia bancaria|fuera de tiktok/i,
    title: "Lleva la compra fuera de TikTok",
    fix: "La venta tiene que quedarse en TikTok Shop: quita webs, WhatsApp, DMs y otros métodos de pago.",
  },
  {
    id: "identidad-real",
    level: "block",
    match:
      /misma cara (del|de la) (vídeo|video|referencia)|copia la cara|clona (la|su) (cara|voz)|imita a @|se parezca a (una )?(famos|celebrit|influencer conocid)|persona real conocida/i,
    title: "Copiar la cara o la voz de una persona real",
    fix: "El protagonista debe ser un figurante ficticio. De un vídeo de referencia copiamos el estilo, nunca la persona.",
  },
  {
    id: "menores",
    level: "warn",
    match: /\bbeb[ée]s?\b|niñ[oa]s? (de|pequeñ)|menor de edad|escolar|guardería/i,
    title: "Aparecen menores o producto infantil",
    fix: "No pueden salir menores en la pieza. Muestra solo el producto y menciona el uso con supervisión adulta.",
  },
  {
    id: "urgencia-falsa",
    level: "warn",
    match: /solo hoy|últimas unidades|stock limitado|se agota en|oferta que desaparece|corre antes de que/i,
    title: "Urgencia o escasez sin respaldo",
    fix: "Si la oferta no es real y verificable en tu ficha, quítala: TikTok penaliza la urgencia falsa.",
  },
  {
    id: "precio",
    level: "warn",
    match: /\bgratis\b|regalo seguro|descuento del \d+ ?%|\d+ ?% de descuento|precio más bajo|el más barato/i,
    title: "Precio, descuento o regalo en el guion",
    fix: "Solo puedes decirlo si coincide exactamente con el precio y la promoción activos en la ficha del producto.",
  },
  {
    id: "superlativo",
    level: "warn",
    match: /el mejor del mundo|100 ?% (efectiv|natural|seguro)|número ?1|nº ?1|único que funciona|sin efectos secundarios/i,
    title: "Afirmación absoluta",
    fix: "Cámbialo por una opinión personal («a mí me ha funcionado»), que sí está permitida.",
  },
  {
    id: "marcas",
    level: "warn",
    match: /mejor que (dyson|apple|nike|zara|medicube|rituals|adidas|samsung)|copia de (dyson|apple|nike|zara)|tipo dyson|estilo apple/i,
    title: "Comparación o referencia a otra marca",
    fix: "Quita la marca ajena: comparar o imitar marcas registradas puede tumbar el vídeo y la cuenta.",
  },
  {
    id: "texto-sobreimpreso",
    level: "warn",
    match: /texto en pantalla|subtítulos quemados|rótulo que diga|cartel que diga/i,
    title: "Texto sobreimpreso generado por la IA",
    fix: "El texto generado sale con faltas. Genera el vídeo limpio y añade el rótulo al publicar.",
  },
];

export function checkPolicy(text: string | null | undefined): PolicyIssue[] {
  const value = (text ?? "").trim();
  if (!value) return [];
  return RULES.filter((r) => r.match.test(value)).map(({ match: _m, ...issue }) => issue);
}

/** Instrucción correctiva para el modelo con los avisos detectados. */
export function policyFixBlock(issues: PolicyIssue[]): string {
  const warnings = issues.filter((i) => i.level === "warn");
  if (warnings.length === 0) return "";
  return (
    "Corrige estos puntos al montar la escena y el audio, sin cambiar la idea: " +
    warnings.map((i) => `${i.title.toLowerCase()} → ${i.fix}`).join(" ")
  );
}

export const hasBlocking = (issues: PolicyIssue[]) => issues.some((i) => i.level === "block");

/** Reglas que se añaden al prompt para que el modelo no genere infracciones. */
export const POLICY_BLOCK =
  "Normas de TikTok Shop obligatorias: sin promesas médicas ni de resultados, sin curar ni tratar nada, sin menores, " +
  "sin urgencia ni escasez inventada, sin precios ni descuentos que no estén en la ficha, sin marcas ajenas ni logotipos, " +
  "sin texto sobreimpreso y sin dirigir la compra fuera de TikTok. Tono de experiencia personal, no de anuncio médico.";

/** Instrucción para copiar el estilo de un vídeo de referencia sin copiar a nadie. */
export const STYLE_REFERENCE_BLOCK =
  "Referencia de estilo (solo la forma, nunca las personas): reproduce el tipo de gancho de los primeros segundos, " +
  "el ritmo, el encuadre y el movimiento de cámara, el esquema de luz y el tono de la voz, y sobre todo la manera en la " +
  "que se muestra el producto (ángulos, distancia, manos, superficie, cómo se abre o se usa). No copies ni te acerques a " +
  "la cara, el cuerpo, el pelo, la ropa, la voz ni la identidad de ninguna persona de la referencia: el protagonista es el " +
  "figurante ficticio descrito arriba. No reproduzcas texto, logotipos ni música de la referencia.";
