import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import searchBlogPosts from "./tools/search-blog-posts";
import getAgencyOverview from "./tools/get-agency-overview";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "tikshoptok-agency",
  title: "TikShopTok Agency",
  version: "0.1.0",
  instructions:
    "Herramientas de TikShopTok, agencia de TikTok Shop y social commerce. Usa get_agency_overview para el contexto de la agencia, list_blog_posts y search_blog_posts para encontrar entradas del blog (incluido el tracker diario 'Pulso TikTok Shop España'), y get_blog_post para leer una entrada completa.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getAgencyOverview, listBlogPosts, searchBlogPosts, getBlogPost],
});
