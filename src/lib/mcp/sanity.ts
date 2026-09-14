import { createClient } from "@sanity/client";

// Lazy factory: no env reads or I/O at module load time.
export function mcpSanityClient() {
  return createClient({
    projectId: "215aijyj",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
  });
}
