import registryCopyZh from "./i18n/registry-copy/zh-CN.json";
import type { Item } from "@/site/catalog";
import type { Locale } from "@/site/i18n/locales";

export function registryCopy(locale: Locale, item: Item) {
  if (locale === "en") return { title: item.title, description: item.description };
  return (
    registryCopyZh[item.name as keyof typeof registryCopyZh] ?? { title: item.title, description: item.description }
  );
}
