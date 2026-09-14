import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { mcpSanityClient } from "../sanity";

type Block = {
  _type?: string;
  style?: string;
  children?: { text?: string }[];
  rows?: { cells?: string[] }[];
};

function toPlainText(body: unknown): string {
  if (!Array.isArray(body)) return "";
  return (body as Block[])
    .map((block) => {
      if (block._type === "table") {
        return (block.rows ?? []).map((row) => (row.cells ?? []).join(" | ")).join("\n");
      }
      const text = (block.children ?? []).map((c) => c.text ?? "").join("");
      if (block.style === "h2") return `## ${text}`;
      if (block.style === "h3") return `### ${text}`;
      if (block.style === "h4") return `#### ${text}`;
      if (block.style === "blockquote") return `> ${text}`;
      return text;
    })
    .filter(Boolean)
    .join("\n\n");
}

export default defineTool({
  name: "get_blog_post",
  title: "Get blog post",
  description: "Get one TikShopTok blog post by slug, including its full body as plain text.",
  inputSchema: { slug: z.string().trim().min(1).describe("The post slug, e.g. pulso-tiktok-shop-espana-2026-09-14.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const post = await mcpSanityClient().fetch(
      `*[_type == "post" && slug.current == $slug][0]{
        title, "slug": slug.current, publishedAt, category, tags, excerpt, body
      }`,
      { slug },
    );
    if (!post) throw new ToolError(`No blog post found with slug "${slug}".`);
    const result = { ...post, body: toPlainText(post.body), url: `https://tikshoptok.com/blog/${slug}` };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: { post: result },
    };
  },
});
