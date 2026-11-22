import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/site/i18n/locales";

export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    metadataBase: new URL("https://ui.abnormalhq.com"),
    title: { default: t("siteTitle"), template: t("titleTemplate") },
    description: t("siteDescription"),
  };
}

export async function pageMetadata(locale: Locale, page: "design" | "gallery"): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "PageMetadata" });
  return { title: t(`${page}Title`), description: t(`${page}Description`) };
}
