# Superar a TrendGen en el estudio de contenido

He analizado TrendGen a fondo. Su fuerza no es el modelo de vídeo: es que **el usuario no escribe nada**. Sube una captura de la ficha del producto de TikTok Shop y recibe la pieza terminada (vídeo o carrusel) con guion, voz, subtítulos con la tipografía de TikTok, y el título, la descripción y los hashtags listos para pegar. Todo por 1,33–2,29 € la pieza.

Hoy nuestro estudio es más potente (hasta 50 s, coherencia de personaje, 3D, puntos ciegos) pero pide demasiado al usuario: elegir preset, escribir guion, formato, duración, calidad, tokens. Ese es el hueco a cerrar.

## Lo que vamos a construir, en tres fases

### Fase 1 — De captura a contenido en un paso
- Nueva pestaña de entrada al estudio: **"Sube tu captura"**. Arrastras la captura de la ficha del producto (o pegas el enlace de TikTok Shop, que ya funciona).
- Leemos de la imagen: nombre del producto, precio, vendedor y la foto del producto recortada. Se crea solo la ficha de producto en tu biblioteca.
- Elección en un clic: **Vídeo** o **Carrusel**, y estilo (o "automático" y lo elegimos nosotros).
- El resto (guion, formato, duración, calidad) queda en valores por defecto buenos y escondido tras "Ajustes avanzados", para quien quiera el control actual.

### Fase 2 — Carruseles de imágenes
- Formato nuevo que hoy no tenemos y que en TikTok Shop convierte igual o mejor que el vídeo, con un coste de generación mucho menor.
- 6 estilos de salida: prueba en pantalla, antes/después, top 3 consejos, meme/chat, oferta directa y storytime.
- Salen 4–8 imágenes en orden, con el texto sobrepuesto por nosotros (no dibujado por la IA, para que se lea) con tipografía tipo TikTok.
- Descarga en lote (ZIP) y vista previa deslizable.

### Fase 3 — Ficha lista para publicar y prueba de ganchos
- Cada pieza generada trae debajo: **título**, **descripción con 5 hashtags** y **nombre de tarjeta de producto (≤30 caracteres)**, cada uno con botón de copiar.
- **Subtítulos**: transcripción del guion incrustada en el vídeo con estilo TikTok.
- **Prueba de ganchos**: un botón genera de 2 a 5 variantes del mismo producto cambiando solo los primeros segundos, para publicar y ver cuál convierte.
- **Reglas de categoría**: en salud y suplementos, sin promesas médicas y con aviso automático, para no arriesgar la cuenta.

## Precios (dos gamas)
Mantenemos los planes actuales del estudio y añadimos una entrada barata que compite de frente:
- **Arranque — 24,90 €/mes:** 12 vídeos o 40 carruseles. Precio por pieza visible en la tarjeta, como hacen ellos.
- **Creador — 49 €/mes** (el Starter actual, con carruseles incluidos).
- **Pro 149 € y Studio 399 €** se quedan como están, con los carruseles como extra sin coste.
- Cada tarjeta mostrará "X € por vídeo" para que la comparación sea directa.
- **Primera pieza gratis sin tarjeta**: ya damos 5 tokens al registrarse; lo comunicamos como "tu primer vídeo gratis".
- **Si falla, no se cobra**: ya devolvemos los tokens en los fallos; lo hacemos visible en la web y en el estudio.

## Detalles técnicos
- Lectura de la captura: modelo de visión de Gemini vía el gateway de IA, con salida estructurada (nombre, precio, vendedor, categoría) + recorte del producto para usarlo como imagen de referencia en la generación.
- Carruseles: generación de imágenes con Gemini image; el texto se compone encima en el navegador sobre `canvas` y se exporta a PNG, así siempre es legible.
- Subtítulos y montaje del vídeo: composición en cliente con `canvas` + `MediaRecorder` sobre el MP4 generado, sin servidor de vídeo nuevo.
- Nueva tabla `ugc_carousels` (user_id, product_id, estilo, slides jsonb, ficha, estado) con RLS por usuario y GRANT a `authenticated`; imágenes en el bucket privado existente.
- Coste en tokens: un carrusel = 3 tokens (frente a 12 de un vídeo de 8 s), lo que mantiene el margen por encima de 5x.
- El plan Arranque se crea como producto y precio nuevos en el proveedor de pagos y se añade a `planCatalog`.

## Fuera de alcance
- No se toca el diseño de la landing de agencia ni el blog.
- No publicamos en TikTok por el usuario (ellos tampoco lo hacen).
- Los pagos siguen en modo prueba hasta que completes el go-live de Stripe.
