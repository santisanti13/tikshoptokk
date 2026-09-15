import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

const FASTMOSS_API_KEY = Deno.env.get('FASTMOSS_API_KEY');
const FASTMOSS_COOKIE = Deno.env.get('FASTMOSS_COOKIE');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const API_BASE = Deno.env.get('FASTMOSS_API_BASE') ?? 'https://api.fastmoss.com';

type Row = Record<string, string | number | null>;
type Attempt = { path: string; status: number; body: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** Llama a la API de FastMoss probando las rutas documentadas más habituales. */
async function tryApi(paths: string[]): Promise<{ rows: Row[]; attempts: Attempt[] }> {
  const attempts: Attempt[] = [];
  if (!FASTMOSS_API_KEY) return { rows: [], attempts };

  for (const path of paths) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          Authorization: `Bearer ${FASTMOSS_API_KEY}`,
          'X-API-KEY': FASTMOSS_API_KEY,
          Accept: 'application/json',
        },
      });
      const text = await res.text();
      attempts.push({ path, status: res.status, body: text.slice(0, 400) });
      if (!res.ok) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        continue;
      }
      const rows = pickRows(parsed);
      if (rows.length) return { rows, attempts };
    } catch (err) {
      attempts.push({ path, status: 0, body: err instanceof Error ? err.message : 'fetch failed' });
    }
  }
  return { rows: [], attempts };
}

function pickRows(payload: unknown): Row[] {
  const seen = new Set<unknown>();
  const walk = (node: unknown, depth: number): Row[] => {
    if (!node || typeof node !== 'object' || depth > 6 || seen.has(node)) return [];
    seen.add(node);
    if (Array.isArray(node)) {
      const objects = node.filter((n) => n && typeof n === 'object' && !Array.isArray(n)) as Row[];
      return objects.length ? objects : [];
    }
    for (const value of Object.values(node as Record<string, unknown>)) {
      const found = walk(value, depth + 1);
      if (found.length) return found;
    }
    return [];
  };
  return walk(payload, 0);
}

/** Lee la página de ranking de FastMoss con tu sesión mediante Firecrawl. */
async function scrapeWithFirecrawl(url: string): Promise<{ markdown: string; error?: string }> {
  if (!FIRECRAWL_API_KEY) return { markdown: '', error: 'Firecrawl no configurado' };
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 5000,
      ...(FASTMOSS_COOKIE ? { headers: { Cookie: FASTMOSS_COOKIE } } : {}),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Firecrawl failed [${res.status}]: ${text.slice(0, 400)}`);
    return { markdown: '', error: `Firecrawl ${res.status}: ${text.slice(0, 200)}` };
  }
  try {
    const data = JSON.parse(text);
    return { markdown: data?.data?.markdown ?? '' };
  } catch {
    return { markdown: '', error: 'Respuesta de Firecrawl no legible' };
  }
}

/** Convierte tablas markdown en filas. */
function markdownTableRows(markdown: string): Row[] {
  const lines = markdown.split('\n').map((l) => l.trim());
  const out: Row[] = [];
  let header: string[] | null = null;
  for (const line of lines) {
    if (!line.startsWith('|')) {
      header = null;
      continue;
    }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    const row: Row = {};
    cells.forEach((c, i) => {
      row[header?.[i] || `col_${i + 1}`] = c;
    });
    if (Object.values(row).some((v) => v)) out.push(row);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'No autenticado' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: 'No autenticado' }, 401);

    const { data: isAdmin, error: roleError } = await userClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });
    if (roleError || !isAdmin) return json({ error: 'Acceso no autorizado' }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const country = 'ES';
    const diagnostics: Record<string, unknown> = {};

    // 1) Vídeos virales
    const videoApi = await tryApi([
      '/api/v1/video/rank?region=ES&limit=20',
      '/v1/video/rank?region=ES&limit=20',
      '/openapi/v1/video/list?region=ES&limit=20',
    ]);
    diagnostics.videoApiAttempts = videoApi.attempts;
    let videos = videoApi.rows;
    let videoSource = 'fastmoss_api';
    if (!videos.length) {
      const scraped = await scrapeWithFirecrawl('https://www.fastmoss.com/es/video/rank?region=ES');
      videos = markdownTableRows(scraped.markdown);
      videoSource = 'fastmoss_scrape';
      diagnostics.videoScrapeError = scraped.error ?? null;
    }

    // 2) Ranking de tiendas
    const shopApi = await tryApi([
      '/api/v1/shop/rank?region=ES&limit=20',
      '/v1/shop/rank?region=ES&limit=20',
      '/openapi/v1/shop/list?region=ES&limit=20',
    ]);
    diagnostics.shopApiAttempts = shopApi.attempts;
    let shops = shopApi.rows;
    let shopSource = 'fastmoss_api';
    if (!shops.length) {
      const scraped = await scrapeWithFirecrawl('https://www.fastmoss.com/es/shop/rank?region=ES');
      shops = markdownTableRows(scraped.markdown);
      shopSource = 'fastmoss_scrape';
      diagnostics.shopScrapeError = scraped.error ?? null;
    }

    const captured_on = new Date().toISOString().slice(0, 10);
    const saved: string[] = [];

    for (const [ranking_type, rows, source] of [
      ['videos', videos, videoSource],
      ['shops', shops, shopSource],
    ] as const) {
      if (!rows.length) continue;
      const { error } = await admin
        .from('market_snapshots')
        .upsert(
          { captured_on, country, ranking_type, source, rows: rows.slice(0, 50) },
          { onConflict: 'captured_on,country,ranking_type,source' },
        );
      if (error) {
        console.error('snapshot upsert failed:', error.message);
        return json({ error: 'No se pudo guardar la captura', details: error.message }, 500);
      }
      saved.push(ranking_type);
    }

    if (!saved.length) {
      return json(
        {
          success: false,
          error:
            'FastMoss no devolvió datos. Revisa la credencial de FastMoss (clave de API o cookie de sesión).',
          diagnostics,
        },
        502,
      );
    }

    return json({
      success: true,
      captured_on,
      saved,
      counts: { videos: videos.length, shops: shops.length },
      sources: { videos: videoSource, shops: shopSource },
      diagnostics,
    });
  } catch (err) {
    console.error('fastmoss-rankings error:', err);
    return json({ error: err instanceof Error ? err.message : 'Error desconocido' }, 500);
  }
});
