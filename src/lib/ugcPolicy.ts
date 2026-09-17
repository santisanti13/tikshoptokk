// Control de normas de TikTok Shop antes de generar.
// Se usa igual en el estudio (aviso en pantalla) y en el servidor.
// Alineado con la guía oficial "Artificial Intelligence Generated Content (AIGC)"
// del Policy Center de TikTok Shop (28/08/2026).
// Solo se bloquea lo que TikTok prohíbe de raíz (categorías vetadas y suplantar
// a una persona real, famosa, sanitaria o autoridad oficial). Todo lo demás avisa
// y se corrige en el propio guion: generar vídeos siempre tiene que ser posible.

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
      /\bcur(a|ar|ación|an)\b|\btrata\b|tratamiento (de|para)|\benfermedad|cáncer|diabetes|hipertens|ansiedad|depresión|insomnio|elimina (el|la|las|los) (dolor|grasa|arrugas|acné)|pierde \d+\s*(kg|kilos)|adelgaza \d+|milagro|resultados garantizados|garantiza(do|mos)?\b|detox|desintoxica|elimina toxinas/i,
    title: "Promesa médica o resultado garantizado",
    fix: "Habla de tu experiencia y de hábitos («lo uso cada mañana»), sin curar, tratar, eliminar ni garantizar resultados.",
  },
  {
    id: "categoria-prohibida",
    level: "block",
    match:
      /\barma de fuego\b|munición|tabaco|vape|vapeo|cigarr|bebida alcohólica|cerveza|vodka|whisky|casino|apuesta|cripto|bitcoin|dinero rápido|ganar dinero desde casa|cannabis|\bcbd\b|medicamento|receta médica|adelgazante milagroso/i,
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
      /misma cara (del|de la) (vídeo|video|referencia)|copia la cara|clona (la|su) (cara|voz)|imita a @|se parezca a (una )?(famos|celebrit|influencer conocid)|persona real conocida|deepfake|cambio de cara/i,
    title: "Copiar la cara o la voz de una persona real",
    fix: "El protagonista debe ser un figurante ficticio. De un vídeo de referencia copiamos el estilo, nunca la persona.",
  },
  {
    id: "suplanta-sanitario",
    level: "block",
    // Solo bloquea si el protagonista se presenta COMO sanitario, no la simple mención.
    match:
      /(?:soy|actúa como|actua como|haz de|hazme de|interpreta a|personaje|protagonista|avatar|figurante|vestid[oa] de|disfraz de|uniforme de)[^.!?]{0,40}\b(médic[oa]|doctor[a]?|dermatólog|nutricionist|dietist|farmacéutic|enfermer|odontólog|dentista|psicólog|fisioterapeut)\b|bata blanca/i,
    title: "Personaje que aparenta ser sanitario",
    fix: "TikTok prohíbe avatares de IA que se hagan pasar por médicos o expertos en salud. Cambia al protagonista por un cliente normal que cuenta su rutina.",
  },
  {
    id: "mencion-sanitario",
    level: "warn",
    match:
      /\b(dermatólog\w*|nutricionist\w*|dietist\w*|farmacéutic\w*|odontólog\w*|dentista|psicólog\w*|fisioterapeut\w*|médic[oa]s?)\b|experto en salud|especialista en salud|coach de salud/i,
    title: "Mención a profesionales sanitarios",
    fix: "Puedes mencionarlo si es cierto y aparece en la ficha, pero el protagonista no puede parecer un sanitario ni dar consejo médico.",
  },
  {
    id: "suplanta-autoridad",
    level: "block",
    match:
      /\b(polic[ií]a|guardia civil|militar|soldado|aduanas|bombero|juez|jueza|funcionari[oa] público|agente de la autoridad)\b|uniforme (de|policial|militar)|aprobado por el gobierno|certificado oficial del gobierno/i,
    title: "Personaje que aparenta ser una autoridad oficial",
    fix: "No puede parecer que una autoridad, la policía o el gobierno respaldan el producto. Cambia el personaje y quita uniformes y sellos oficiales.",
  },
  {
    id: "imagen-miedo",
    level: "warn",
    match:
      /órgano|intestino|parásito|hígado graso|arteria obstruida|sangre|pus|infección|bacteria dentro del cuerpo|antes con la piel destroz|imagen impactante del interior/i,
    title: "Imágenes de miedo o del interior del cuerpo",
    fix: "TikTok prohíbe usar el miedo para vender salud. Muestra el producto y el uso real, sin órganos, parásitos ni interiores del cuerpo.",
  },
  {
    id: "efecto-imposible",
    level: "warn",
    match:
      /al instante|en segundos (desaparece|se va|se limpia|crece)|resultado inmediato|de repente (limpio|nuevo|perfecto)|se transforma en|antes y después extremo|crece el pelo|quita todas las manchas/i,
    title: "Efecto imposible o exagerado del producto",
    fix: "El vídeo no puede mostrar un resultado que el producto no da de verdad. Muestra el uso normal y un resultado realista.",
  },
  {
    id: "atributos-producto",
    level: "warn",
    match:
      /más grande de lo que es|cambia el tamaño|añade (una )?función|hazlo 3d|brillo mágico|efecto de luz que no tiene|otro color de (envase|packaging)|invéntate (el|un) (tamaño|accesorio|contenido)/i,
    title: "Cambiar cómo es el producto de verdad",
    fix: "Tamaño, envase, color, accesorios y funciones tienen que coincidir con la ficha. No añadas nada que el producto no tenga.",
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
    fix: "Si la oferta no es real y verificable en tu ficha, quítala: TikTok penaliza la urgencia falsa en el contenido con IA.",
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
    match:
      /mejor que (dyson|apple|nike|zara|medicube|rituals|adidas|samsung)|copia de (dyson|apple|nike|zara)|tipo dyson|estilo apple|logo de|logotipo de/i,
    title: "Comparación, logo o marca ajena",
    fix: "Quita la marca y el logotipo ajenos: la IA los deforma y TikTok lo trata como riesgo de propiedad intelectual.",
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
  "Normas de TikTok Shop obligatorias (política oficial de contenido generado con IA): sin promesas médicas ni de resultados, " +
  "sin curar, tratar ni desintoxicar nada, sin personajes que aparenten ser médicos, sanitarios, autoridades, policía o famosos, " +
  "sin imágenes de miedo ni del interior del cuerpo, sin efectos imposibles ni transformaciones instantáneas, sin cambiar el tamaño, " +
  "envase, color ni funciones reales del producto, sin menores, sin urgencia ni escasez inventada, sin precios ni descuentos que no " +
  "estén en la ficha, sin marcas ni logotipos ajenos, sin texto sobreimpreso y sin dirigir la compra fuera de TikTok. " +
  "Movimiento natural y física creíble (manos que sujetan bien el producto, materiales y piel realistas). " +
  "Tono de experiencia personal, no de anuncio médico.";

/** Aviso de transparencia que TikTok exige al publicar contenido hecho con IA. */
export const AIGC_DISCLOSURE_NOTE =
  "TikTok Shop obliga a marcar el vídeo como contenido generado con IA al publicarlo: activa el interruptor «Contenido generado por IA» o añade #aigenerated en la descripción.";

export const AIGC_DISCLOSURE_HASHTAG = "#aigenerated";

/** Instrucción para copiar el estilo de un vídeo de referencia sin copiar a nadie. */
export const STYLE_REFERENCE_BLOCK =
  "Referencia de estilo (solo la forma, nunca las personas): reproduce el tipo de gancho de los primeros segundos, " +
  "el ritmo, el encuadre y el movimiento de cámara, el esquema de luz y el tono de la voz, y sobre todo la manera en la " +
  "que se muestra el producto (ángulos, distancia, manos, superficie, cómo se abre o se usa). No copies ni te acerques a " +
  "la cara, el cuerpo, el pelo, la ropa, la voz ni la identidad de ninguna persona de la referencia: el protagonista es el " +
  "figurante ficticio descrito arriba. No reproduzcas texto, logotipos ni música de la referencia.";
