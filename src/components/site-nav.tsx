"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { cn } from "@/lib/utils";

export type NavGroup = { title: string; items: { name: string; title: string }[] };

function NavLink({
  href,
  label,
  locale,
  onNavigate,
}: {
  href: string;
  label: string;
  locale: Locale;
  onNavigate?: () => void;
}) {
  const current = usePathname() === localeHref(locale, href);
  return (
    <Link
      href={localeHref(locale, href)}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "block rounded-chip px-2 py-1 text-base transition-colors duration-150",
        current
          ? "bg-highlight font-medium text-highlight-foreground"
          : "text-muted-foreground hover:bg-control hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

const shortTitle = (title: string) => title.replace(/^Abnormal /, "");

export function SiteNav({
  groups,
  locale,
  onNavigate,
}: {
  groups: NavGroup[];
  locale: Locale;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Navigation");
  const [query, setQuery] = useState("");
  const resultsId = useId();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Every word has to appear in the item's name or its group, so "menu over" finds the overlay menus.
  const matches = (group: NavGroup, item: NavGroup["items"][number]) =>
    words.every((word) => `${shortTitle(item.title)} ${item.name} ${group.title}`.toLowerCase().includes(word));
  const shown = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(group, item)) }))
    .filter((group) => group.items.length > 0);
  const count = shown.reduce((total, group) => total + group.items.length, 0);

  return (
    <nav aria-label={t("label")} className="grid gap-6">
      <div className="grid gap-2">
        <SearchInput
          size="sm"
          aria-label={t("searchLabel")}
          aria-controls={resultsId}
          placeholder={t("searchPlaceholder")}
          clearLabel={t("clear")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          inputClassName="text-sm"
        />
        {words.length > 0 && (
          <p role="status" className="px-2 text-xs text-muted-foreground">
            {t("results", { count })}
          </p>
        )}
      </div>
      <div id={resultsId} className="grid gap-6">
        {words.length === 0 && (
          <div className="grid gap-1">
            <NavLink href="/" label={t("overview")} locale={locale} onNavigate={onNavigate} />
            <NavLink href="/gallery" label={t("gallery")} locale={locale} onNavigate={onNavigate} />
            <NavLink href="/design" label={t("familyStyle")} locale={locale} onNavigate={onNavigate} />
          </div>
        )}
        {shown.map((group) => (
          <div key={group.title} className="grid gap-1">
            <h2 className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</h2>
            {group.items.map((item) => (
              <NavLink
                key={item.name}
                href={`/components/${item.name}`}
                label={shortTitle(item.title)}
                locale={locale}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
