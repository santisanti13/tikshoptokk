

## Cambiar `@tikshoptokk` → `@tikshoptok` en emails

Se encontraron referencias con doble "k" en 7 plantillas de email. El cambio afecta a:

1. **URL de TikTok** (7 archivos): `@tikshoptokk` → `@tikshoptok` en la URL del video destacado
2. **Texto del footer** (contact-notification.tsx): "tikshoptokk" → "tikshoptok"

### Archivos a modificar
- `supabase/functions/_shared/email-templates/signup.tsx`
- `supabase/functions/_shared/email-templates/recovery.tsx`
- `supabase/functions/_shared/email-templates/magic-link.tsx`
- `supabase/functions/_shared/email-templates/invite.tsx`
- `supabase/functions/_shared/email-templates/email-change.tsx`
- `supabase/functions/_shared/email-templates/reauthentication.tsx`
- `supabase/functions/_shared/email-templates/contact-notification.tsx`

### Pasos
1. Reemplazar `@tikshoptokk` por `@tikshoptok` en todas las URLs y textos
2. Redesplegar las funciones `auth-email-hook` y `send-transactional-email`

> **Nota importante:** Asegúrate de que tu usuario real de TikTok sea `@tikshoptok` (con una sola k), ya que si no, los enlaces al video no funcionarán.

