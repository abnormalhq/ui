import type { MetadataRoute } from "next";
import { items, siteUrl } from "@/site/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...items.map(({ name }) => `/components/${name}`)].map((path) => ({ url: `${siteUrl}${path}` }));
}
