import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { mcpSanityClient } from "../sanity";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "List published TikShopTok blog posts (newest first) with title, slug, date, category, tags and excerpt.",
  inputSchema: {
    limit: z.number().int().optional().describe("How many posts to return. Defaults to 10."),
    category: z
      .string()
      .optional()
      .describe("Optional category filter: tiktok-shop, ugc, productos-virales or estrategia."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, category }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const filter = category ? ` && category == $category` : "";
    const posts = await mcpSanityClient().fetch(
      `*[_type == "post" && defined(slug.current)${filter}] | order(publishedAt desc)[0...$take]{
        title, "slug": slug.current, publishedAt, category, tags, excerpt
      }`,
      { take, ...(category ? { category } : {}) },
    );
    const rows = Array.isArray(posts) ? posts : [];
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { posts: rows },
    };
  },
});
