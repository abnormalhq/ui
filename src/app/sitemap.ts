import type { MetadataRoute } from "next";
import { items, siteUrl } from "@/site/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/design", "/gallery", ...items.map(({ name }) => "/components/" + name)];
  return paths.flatMap((path) => {
    const englishUrl = siteUrl + path;
    const chineseUrl = siteUrl + "/zh" + path;
    const languages = { en: englishUrl, "zh-CN": chineseUrl, "x-default": englishUrl };
    return [
      { url: englishUrl, alternates: { languages } },
      { url: chineseUrl, alternates: { languages } },
    ];
  });
}
