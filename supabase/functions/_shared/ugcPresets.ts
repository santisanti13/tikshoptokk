// Biblioteca de estilos UGC. Cada preset aporta:
// - recipe: instrucciones técnicas fijas que se añaden al guion antes de generar.
// - guidance: reglas de redacción para el asistente de guiones.
// - examples: guiones de referencia (few-shot) que fijan el estilo de salida.

export type UgcPreset = {
  id: string;
  label: string;
  hint: string;
  aspectRatio?: "9:16" | "16:9";
  recipe: string;
  guidance: string;
  examples: string[];
};

export const UGC_PRESETS: UgcPreset[] = [
  {
    id: "cara",
    label: "UGC cara",
    hint: "Primer plano hablando a cámara, estilo selfie.",
    aspectRatio: "9:16",
    recipe:
      "Plano medio corto de la persona hablando directamente a cámara, móvil sostenido con la mano a la altura de los ojos, ligero temblor natural. Luz de ventana suave sobre la cara. Fondo doméstico real y algo desordenado. Audio: voz cercana grabada con el micrófono del móvil, ambiente de habitación, sin música de producción. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "El protagonista habla a cámara en primera persona. Incluye la frase que dice, introducida con dos puntos tras el hablante y sin comillas. Empieza con un gancho hablado de una frase.",
    examples: [
      "Chica de unos 25 años, pelo recogido, sudadera gris, en el baño de casa por la mañana. Sostiene el móvil con la mano y habla directa a cámara en plano medio corto, ligero temblor. Luz de ventana suave y fondo con azulejos y algún bote a la vista. Ella dice: llevaba dos años con la piel apagada y esto es lo único que me ha cambiado la cara. Coge el sérum, se echa dos gotas en la mano y se lo aplica en la mejilla mientras sigue hablando. Audio: voz cercana de micrófono de móvil, eco leve de baño, sin música. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "cuerpo-completo",
    label: "UGC cuerpo completo",
    hint: "Plano entero: outfits, tallas, movimiento.",
    aspectRatio: "9:16",
    recipe:
      "Plano entero de la persona, móvil apoyado en un mueble o espejo, cámara fija a la altura del pecho. La persona se mueve, gira y muestra el producto de cuerpo completo. Luz de habitación real. Audio: voz en tono cercano y ambiente de casa. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Describe el movimiento del cuerpo (giro, caminar hacia cámara, mostrar detalle) y la ropa o el producto puesto. Menciona el encuadre entero de pies a cabeza.",
    examples: [
      "Mujer de unos 30 años frente al espejo de cuerpo entero de su habitación, con un conjunto de punto beige. El móvil está apoyado en la cómoda, cámara fija, plano entero de pies a cabeza. Ella se gira despacio para mostrar la caída del pantalón, se toca el bajo del jersey y camina un paso hacia cámara. Luz cálida de lámpara y algo de ropa a la vista al fondo. Ella dice: mido metro sesenta y me llevé la talla S, mira cómo cae. Audio: voz cercana, ambiente de habitación, sin música. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "pov",
    label: "UGC POV",
    hint: "Cámara en primera persona, manos a la vista.",
    aspectRatio: "9:16",
    recipe:
      "Punto de vista en primera persona: la cámara es la mirada de la persona y solo se ven sus manos y el producto. Móvil en la mano libre o a la altura del pecho, movimiento natural al caminar o manipular. Luz del sitio real. Audio: voz en off cercana como si pensara en voz alta, sonidos de manipulación del producto. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "No describas la cara del protagonista: solo manos, producto y entorno desde su mirada. Usa voz en off en primera persona.",
    examples: [
      "Punto de vista en primera persona en una cocina pequeña por la mañana. Solo se ven las manos abriendo la freidora de aire, colocando la cesta y echando las patatas. La cámara se mueve con la respiración, plano cercano sobre las manos. Luz natural entrando por la ventana. Voz en off cercana: lleva tres semanas en mi cocina y ya no enciendo el horno. Sonido de la cesta al encajar y del temporizador. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "producto-off",
    label: "Producto narrado en off",
    hint: "Solo producto, voz en off vendiendo.",
    aspectRatio: "9:16",
    recipe:
      "Sin personas en cuadro: solo el producto sobre una superficie real de casa. Cámara de móvil en mano acercándose despacio y rodeando ligeramente el producto, plano cercano con detalle de textura. Luz natural lateral. Audio: voz en off cercana y convincente, ambiente sutil, sin música de anuncio. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Describe solo el producto, el movimiento de cámara y la voz en off. No inventes personas ni manos salvo que se pidan.",
    examples: [
      "Bote de suplemento sobre la encimera de madera de una cocina, junto a un vaso de agua. La cámara del móvil se acerca despacio en plano cercano y rodea el bote para mostrar la etiqueta y la tapa. Luz natural lateral que marca el relieve del envase. Voz en off cercana: lo tomo cada mañana desde marzo y es lo único que noto en la digestión. Ambiente suave de cocina, sin música. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "unboxing",
    label: "Unboxing",
    hint: "Abrir el paquete y primera reacción.",
    aspectRatio: "9:16",
    recipe:
      "Plano picado sobre una mesa o el sofá: manos abriendo el paquete y sacando el producto por primera vez. Móvil apoyado o sostenido justo encima, ligero movimiento. Luz de salón real. Audio: sonido de cartón y plástico, voz cercana reaccionando. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Céntrate en el gesto de abrir y en la primera reacción hablada. Menciona los sonidos del embalaje.",
    examples: [
      "Plano picado sobre la mesa del salón: manos de una chica rasgando la bolsa de envío y sacando un vestido midi verde doblado. El móvil está justo encima con ligero temblor, plano cercano de manos y tejido. Luz de tarde por la ventana. Ella dice mientras lo despliega: no esperaba este tacto por veintinueve euros. Sonido de plástico rasgándose y tela al desdoblarse. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "demo",
    label: "Demo de uso",
    hint: "Enseñar el producto funcionando paso a paso.",
    aspectRatio: "9:16",
    recipe:
      "Plano medio con el producto en uso real, cámara de móvil fija o con leve reencuadre para seguir la acción. Se ve claramente el resultado que produce el producto. Luz del sitio real. Audio: voz explicando en tono cercano y sonidos del propio uso. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Describe un único gesto de uso y su resultado visible. Nada de secuencias en varios sitios.",
    examples: [
      "Chico joven en la mesa de su cocina usando la maleta de cabina abierta en el suelo. Plano medio con el móvil apoyado en una silla, leve reencuadre para seguir sus manos mientras mete un portátil en el compartimento delantero y cierra la cremallera. Luz de tarde y cocina real al fondo. Él dice: cabe el portátil, el neceser y cuatro camisetas sin facturar. Sonido de cremallera y ruedas al girar. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "testimonio",
    label: "Testimonio antes / después",
    hint: "Contar el problema y el resultado.",
    aspectRatio: "9:16",
    recipe:
      "Plano medio de la persona sentada hablando a cámara con el producto en la mano, móvil apoyado, cámara fija. En un momento acerca el producto al objetivo. Luz de casa real. Audio: voz tranquila y creíble, ambiente doméstico. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Estructura la frase hablada en dos partes: cómo estaba antes y qué pasa ahora. Sin promesas médicas ni cifras inventadas.",
    examples: [
      "Mujer de unos 40 años sentada en el sofá de su salón, con el bote de suplemento en la mano. Plano medio, móvil apoyado en la mesa, cámara fija. Luz cálida de lámpara y cojines a la vista. Ella habla tranquila a cámara y dice: pasé el invierno sin energía y desde que lo tomo llego a la tarde entera. Al final acerca el bote al objetivo unos segundos. Audio: voz cercana, ambiente de salón, sin música. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
  {
    id: "horizontal-marca",
    label: "Marca horizontal",
    hint: "Pieza cuidada 16:9 para web y anuncios.",
    aspectRatio: "16:9",
    recipe:
      "Plano horizontal cuidado con cámara estable y movimiento lento (leve dolly o panorámica). Composición limpia, producto bien colocado en el tercio del encuadre. Luz suave y dirigida. Audio: voz en off serena y música instrumental discreta. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    guidance:
      "Tono de marca, no casero. Describe la composición, el movimiento lento de cámara y la voz en off.",
    examples: [
      "Encuadre horizontal de un escritorio de madera con la freidora de aire en el tercio derecho y una planta desenfocada a la izquierda. La cámara avanza lentamente hacia el producto, estable, sin temblor. Luz suave lateral que dibuja el acabado mate. Voz en off serena: cocina para cuatro en veinte minutos, sin encender el horno. Música instrumental discreta de fondo. Plano continuo, sin cortes de escena. Sin texto en pantalla.",
    ],
  },
];

export const getPreset = (id?: string | null): UgcPreset | null =>
  UGC_PRESETS.find((p) => p.id === id) ?? null;
