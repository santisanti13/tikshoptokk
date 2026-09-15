# Datos reales de FastMoss + panel de tokens

Dos entregas independientes: traer los rankings reales de TikTok Shop España desde tu cuenta de FastMoss, y un panel privado (solo para ti) donde cargas tokens a mano y ves el historial.

## 1. Fuente real: FastMoss

Objetivo: cada edición del pulso se apoya en datos recién traídos de FastMoss (vídeos con visitas, likes, engagement y ranking de tiendas de España), no en resultados arrastrados.

- Nueva función de servidor `fastmoss-rankings` que consulta FastMoss con tu acceso y devuelve dos listas normalizadas: top vídeos de España (creador, producto, visitas, likes, comentarios, compartidos, engagement, enlace) y top tiendas (GMV, unidades, crecimiento).
- Los resultados se guardan en una tabla nueva `market_snapshots` (fecha, país, tipo de ranking, filas en JSON, origen) para que cada edición del blog quede fechada y auditable, y para no repetir llamadas el mismo día.
- Panel interno "Pulso de mercado" (solo para ti) con botón *Actualizar datos*, fecha real de la última captura y las dos tablas listas para copiar al post. Si la llamada falla, se ve el motivo en claro en lugar de datos silenciosamente viejos.
- La tabla de productos virales que ya existe en `/product-research` pasa a leer estos datos reales en vez del listado curado, manteniendo el mismo diseño.

Aviso honesto: FastMoss no publica una API abierta para todos los planes. Al empezar te pediré tu credencial de FastMoss por el formulario seguro y comprobaré, con una llamada real, si tu plan da acceso por API. Si no lo da, la alternativa es leer tus páginas de ranking de FastMoss con tu sesión (Firecrawl ya está conectado) — funciona, pero es más frágil y te avisaré si FastMoss cambia la página. Te confirmo cuál de los dos caminos quedó activo antes de seguir.

## 2. Panel de tokens (solo admin)

- Rol de administrador propio (tabla de roles aparte, no en el perfil) con tu cuenta como único admin. Ningún cliente puede darse tokens.
- Nueva página `/admin/tokens`, visible solo para admins:
  - Buscar cliente por correo y ver su saldo, plan y renovación.
  - Cargar tokens a mano: cantidad, motivo y confirmación; queda registrado a tu nombre.
  - Restar tokens (corrección de errores) con el mismo registro.
  - Historial completo de movimientos: fecha, concepto, cantidad, vídeo asociado y saldo resultante, con filtro por cliente.
  - Resumen arriba: tu saldo, total de tokens cargados y consumidos del mes.
- Si alguien sin permiso entra a la dirección, ve un mensaje de acceso no autorizado.

## Detalles técnicos

- Migración: `app_role` enum + `user_roles` + `has_role()` security definer; `market_snapshots` (RLS: lectura pública solo de la última captura publicada, escritura solo service_role); GRANTs explícitos en ambas tablas.
- `ugc_admin_adjust_tokens(_user_id, _delta, _reason)`: security definer que valida `has_role(auth.uid(),'admin')`, reutiliza la lógica de `ugc_grant_tokens`/`ugc_charge_tokens` y escribe en `ugc_token_ledger` con metadata `{actor}`.
- Nueva política de lectura en `ugc_token_accounts` y `ugc_token_ledger` para admins (además de la de propietario), para que el panel pueda listar movimientos de cualquier cliente.
- `supabase/functions/fastmoss-rankings/index.ts`: valida JWT + rol admin, normaliza la respuesta, hace upsert en `market_snapshots`, devuelve estado y cuerpo del proveedor cuando falla. Secreto `FASTMOSS_API_KEY` (o cookie de sesión) vía formulario seguro.
- Frontend: `src/pages/AdminTokens.tsx`, `src/pages/AdminPulso.tsx`, `src/hooks/useIsAdmin.ts`, rutas nuevas en `App.tsx` bajo `RequireAuth` + guarda de rol. `ViralProductsTable.tsx` pasa a consumir `market_snapshots`.
