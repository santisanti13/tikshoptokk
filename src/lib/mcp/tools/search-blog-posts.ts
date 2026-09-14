import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { mcpSanityClient } from "../sanity";

export default defineTool({
  name: "search_blog_posts",
  title: "Search blog posts",
  description:
    "Search TikShopTok blog posts by free text across title, excerpt and tags. Returns matching posts newest first.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search text, e.g. 'creadores UGC' or 'ranking tiendas'."),
    limit: z.number().int().optional().describe("How many results to return. Defaults to 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const posts = await mcpSanityClient().fetch(
      `*[_type == "post" && defined(slug.current) && (
          title match $q || excerpt match $q || $q in tags[] || count(tags[@ match $q]) > 0
       )] | order(publishedAt desc)[0...$take]{
        title, "slug": slug.current, publishedAt, category, tags, excerpt
      }`,
      { q: `*${query}*`, take },
    );
    const rows = Array.isArray(posts) ? posts : [];
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { results: rows, query },
    };
  },
});
