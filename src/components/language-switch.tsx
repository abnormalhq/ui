"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/site/i18n/locales";
import { localeSwitchHref } from "@/site/i18n/locale-path";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const t = useTranslations("SiteHeader");
  const [locationParts, setLocationParts] = useState({ search: "", hash: "" });

  useEffect(() => {
    const syncLocation = () => setLocationParts({ search: window.location.search, hash: window.location.hash });
    syncLocation();
    window.addEventListener("popstate", syncLocation);
    window.addEventListener("hashchange", syncLocation);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("hashchange", syncLocation);
    };
  }, [pathname]);

  function preserveLocation(target: Locale, event: React.SyntheticEvent<HTMLAnchorElement>) {
    if (typeof window === "undefined") return;
    event.currentTarget.href = new URL(
      localeSwitchHref(target, window.location.pathname, window.location.search, window.location.hash),
      window.location.origin,
    ).href;
  }

  return (
    <nav aria-label={t("languageLabel")} className="flex items-center gap-1 text-sm">
      <a
        href={localeSwitchHref("en", pathname, locationParts.search, locationParts.hash)}
        lang="en"
        hrefLang="en"
        aria-current={locale === "en" ? "page" : undefined}
        onClick={(event) => preserveLocation("en", event)}
        onPointerDown={(event) => preserveLocation("en", event)}
        onFocus={(event) => preserveLocation("en", event)}
        className="rounded-chip px-1.5 py-1 text-muted-foreground hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
      >
        English
      </a>
      <span aria-hidden="true" className="text-border">
        /
      </span>
      <a
        href={localeSwitchHref("zh-CN", pathname, locationParts.search, locationParts.hash)}
        lang="zh-CN"
        hrefLang="zh-CN"
        aria-current={locale === "zh-CN" ? "page" : undefined}
        onClick={(event) => preserveLocation("zh-CN", event)}
        onPointerDown={(event) => preserveLocation("zh-CN", event)}
        onFocus={(event) => preserveLocation("zh-CN", event)}
        className="rounded-chip px-1.5 py-1 text-muted-foreground hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
      >
        中文
      </a>
    </nav>
  );
}
