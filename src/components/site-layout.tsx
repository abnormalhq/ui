import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { preload } from "react-dom";
import type { Locale } from "@/site/i18n/locales";
import { ThemeScript } from "@/components/ui/theme-script";
import { catalog } from "@/site/catalog";
import { SiteHeader } from "@/site/components/site-header";
import { SiteNav } from "@/site/components/site-nav";
import { registryCopy } from "@/site/registry-copy";

const fontOptions = { as: "font", type: "font/woff2", crossOrigin: "anonymous" } as const;

export async function SiteLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  setRequestLocale(locale);
  preload("/fonts/Inter-Variable.woff2", fontOptions);
  preload("/fonts/BricolageGrotesque-Variable.woff2", fontOptions);
  preload("/fonts/JetBrainsMono-Variable.woff2", fontOptions);

  const messages = await getMessages();
  const categoryT = await getTranslations({ locale, namespace: "Catalog" });
  const groups = catalog.map(({ items }, index) => ({
    title: categoryT(`groups.${index}`),
    items: items.map((item) => ({ name: item.name, title: registryCopy(locale, item).title })),
  }));
  const clientMessages = {
    Navigation: messages.Navigation,
    SiteHeader: messages.SiteHeader,
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- Shared root layout supplies the document head for the pre-paint theme script. */}
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <SiteHeader groups={groups} locale={locale} />
          <div className="mx-auto flex w-full max-w-[1400px]">
            <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border px-3 py-6 lg:block">
              <SiteNav groups={groups} locale={locale} />
            </aside>
            <main className="min-w-0 flex-1 px-4 py-10 md:px-10 md:py-12">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
