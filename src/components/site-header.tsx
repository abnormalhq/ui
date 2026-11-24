"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrandMark, BrandName } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TextLink } from "@/components/ui/text-link";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";
import { useThemePreference } from "@/components/ui/use-theme-preference";
import { LanguageSwitch } from "@/site/components/language-switch";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { SiteNav, type NavGroup } from "@/site/components/site-nav";

/** The registry's ThemePicker over the preference the registry's ThemeScript keeps. */
function SiteThemePicker() {
  const t = useTranslations("SiteHeader");
  const [value, setValue] = useThemePreference();
  const labels: Record<ThemePreference, string> = {
    system: t("themeSystem"),
    light: t("themeLight"),
    dark: t("themeDark"),
  };
  return (
    <ThemePicker
      value={value}
      onValueChange={setValue}
      labels={labels}
      label={t("themeLabel", { theme: labels[value ?? "system"] })}
    />
  );
}

function MobileNav({ groups, locale }: { groups: NavGroup[]; locale: Locale }) {
  const t = useTranslations("SiteHeader");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("openNavigation")}>
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" closeLabel={t("closeNavigation")} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Abnormal UI</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <SiteNav groups={groups} locale={locale} onNavigate={() => setOpen(false)} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader({ groups, locale }: { groups: NavGroup[]; locale: Locale }) {
  const t = useTranslations("SiteHeader");
  return (
    // eslint-disable-next-line abnormal/no-hardcoded-classes -- above the demos' own sticky page headers (z-header) as they scroll under it.
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <MobileNav groups={groups} locale={locale} />
        <Link href={localeHref(locale, "/")} className="flex items-center gap-2.5">
          <BrandMark className="size-6" />
          <BrandName className="text-lg" />
          <span className="sr-only">{t("overview")}</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <TextLink href="/r/registry.json" className="text-sm max-[37.4375rem]:hidden">
            registry.json
          </TextLink>
          <LanguageSwitch locale={locale} />
          <SiteThemePicker />
        </div>
      </div>
    </header>
  );
}
