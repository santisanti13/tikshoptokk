import { createClient } from "@sanity/client";
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://tikshoptok.com";

const sanityClient = createClient({
  projectId: "215aijyj",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function generate() {
  const posts = await sanityClient.fetch(`*[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    publishedAt
  }`);

  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/product-research", changefreq: "weekly", priority: "0.8" },
    { path: "/contenido-ia", changefreq: "weekly", priority: "0.8" },
    { path: "/productos", changefreq: "weekly", priority: "0.7" },
    { path: "/blog", changefreq: "weekly", priority: "0.8" },
  ];

  // Páginas locales de la agencia (una por ciudad).
  for (const ciudad of ["valencia", "madrid", "barcelona", "sevilla"]) {
    entries.push({ path: `/agencia-tiktok-shop/${ciudad}`, changefreq: "monthly", priority: "0.7" });
  }

  for (const post of posts) {
    entries.push({
      path: `/blog/${post.slug}`,
      changefreq: "weekly",
      priority: "0.6",
      lastmod: post.publishedAt ? new Date(post.publishedAt).toISOString().split("T")[0] : undefined,
    });
  }

  const urls = entries.map((e) => {
    const lines = [`  <url>`, `    <loc>${BASE_URL}${e.path}</loc>`];
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
    lines.push(`  </url>`);
    return lines.join("\n");
  });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
