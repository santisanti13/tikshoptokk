# Un solo camino claro: producto → referencia → avatar → pieza

Hoy el estudio tiene las piezas correctas pero desordenadas: "Proyectos" no se
entiende, el enlace de la ficha de la tienda y el vídeo de referencia se piden en
el mismo sitio, y no queda claro qué hace cada uno. Lo convertimos en un flujo
guiado de cuatro pasos, con nombres que se entienden y con los dos tipos de
enlace bien separados.

## 1. "Proyectos" pasa a llamarse "Avatares"

- Nuevo nombre en el menú, en los títulos y en los textos: un avatar es la
  persona que sale en tus vídeos (cara, look, voz, tono).
- La ficha del avatar se explica así: foto de la persona, cómo es, cómo habla y
  notas de marca. Todo lo demás se mantiene igual (tus avatares actuales siguen
  ahí, no se pierde nada).

## 2. Crear pasa a ser un flujo de 4 pasos

Una sola pantalla "Crear", con los pasos numerados y visibles siempre:

```text
1 Producto        2 Referencia e idea      3 Avatar            4 Pieza
ficha de tienda   vídeo que copiar        quién aparece       vídeo o carrusel
foto, uso, forma  o título ideal          o sin persona       formato y calidad
```

- **Paso 1 · Producto.** Se elige de tu biblioteca (o se crea al momento). Se ve
  la foto, la descripción, el uso y los puntos ciegos que se van a respetar, con
  un aviso claro si falta algo importante: es lo que evita que TikTok te
  sancione por mostrar un producto que no es el tuyo.
- **Paso 2 · Referencia e idea.** Dos entradas separadas y excluyentes en el
  texto: escribir el título/idea, o pegar un **vídeo de referencia** para copiar
  sus puntos fuertes (gancho, ritmo, luz, cámara, cómo enseña el producto —
  nunca la cara, el cuerpo ni la voz de quien sale).
- **Paso 3 · Avatar.** Elegir avatar guardado, personaje de un vídeo anterior, o
  "sin persona" (solo producto). Aquí van también las imágenes de referencia.
- **Paso 4 · Pieza.** Vídeo o carrusel. Al elegir, se muestran solo los ajustes
  que aplican y el coste en tokens.

En cada paso, una línea de resumen de lo ya elegido, para que se vea cómo se
conectan los puntos. Los pasos se pueden tocar en cualquier orden; solo se
marcan como pendientes los que faltan para generar.

## 3. Los dos enlaces de TikTok, bien diferenciados

- **Ficha del producto (tienda)** — vive solo en Productos y en el paso 1. Sirve
  para rellenar nombre, precio, foto y ficha. Icono de bolsa y texto propio.
- **Vídeo de referencia** — vive solo en el paso 2. Sirve para copiar el estilo
  del vídeo. Icono de claqueta y texto propio.

Si se pega un enlace en el sitio equivocado, lo detectamos y lo movemos al sitio
correcto avisando, en lugar de tratarlo como si fuera lo mismo.

## 4. Enlazar productos desde el móvil (el problema real)

En el escritorio TikTok Shop no existe, así que el enlace de la ficha no abre
nada útil y hoy termina en la portada de TikTok. Cambios:

- El chip "TikTok" de cada producto abre exactamente la ficha guardada, nunca la
  portada. Si el enlace guardado no es una ficha, no se muestra el botón.
- En escritorio: aviso de que la ficha solo se abre bien en el móvil, con botón
  **Copiar enlace** y un código QR para abrirlo en el teléfono.
- En móvil: botón **Abrir en la app de TikTok** y, al lado, instrucciones cortas
  de cómo copiar el enlace desde la app (Compartir → Copiar enlace) y pegarlo
  aquí.
- Si TikTok bloquea la lectura del enlace (pasa a menudo), el paso siguiente es
  siempre el mismo y explícito: pega la captura de la ficha y la leemos entera.

## 5. Un guion para vídeo y otro para carrusel

- **Vídeo**: guion de escena — encuadre, cámara, luz, voz, ritmo. Como ahora.
- **Carrusel**: guion de láminas — gancho de la lámina 1, argumentos por lámina,
  cierre y llamada. Botón propio "Escribir carrusel" que usa el producto, el
  título/idea y, si hay, el vídeo de referencia.

Así el asistente deja de escribir texto de vídeo para una pieza de imágenes.

## Detalles técnicos

- Renombrado solo de cara al usuario: la tabla `ugc_projects` y sus datos no se
  tocan; cambian etiquetas, títulos y textos (`StudioShell`, `UgcStudio`,
  `ProjectsPanel` → `AvatarsPanel`).
- Nuevo componente de pasos (`CreateFlow`) que envuelve el panel de generación
  actual y el de carrusel, compartiendo `productId`, avatar, referencia e idea;
  la lógica de generación, tokens y política se reutiliza sin cambios.
- `TikTokLinkInput` recibe un `mode: "product" | "video"` que fija icono, texto,
  validación de URL y el aviso al pegar el tipo equivocado.
- Nuevo `ProductShopLink` con detección de móvil (`useIsMobile`), copiar enlace y
  QR generado en cliente.
- El asistente de carrusel llama a `ugc-prompt` con un `kind: "carousel"` nuevo
  que cambia las instrucciones del sistema en la función del servidor.
- Sin cambios de base de datos y sin tocar precios ni límites.

## Fuera de alcance

- No se toca la landing de agencia, el blog ni la investigación de productos.
- No se publica nada en TikTok automáticamente.
- No cambian las tarifas ni el coste en tokens de cada pieza.
