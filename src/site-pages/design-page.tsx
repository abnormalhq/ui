import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Marker } from "@/components/ui/marker";
import { Eyebrow, SectionTitle } from "@/components/ui/section-heading";
import { StatusLabel } from "@/components/ui/status-label";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { installCommand } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import { DataPreview, StatusPreview } from "@/site/components/pattern-previews";
import { ReadingPreview } from "@/site/components/reading-preview";
import { implementationRules, palette, principles, productGuidance, typography } from "@/site/design";

function GuideSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-20 gap-5">
      <h2 id={`${id}-title`} className="font-heading text-2xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Rules({ rows }: { rows: readonly (readonly string[])[] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([title, ...detail]) => (
        <div key={title} className="grid gap-1.5 py-4 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
          <dt className="font-medium">{title}</dt>
          <dd className="grid gap-1 text-muted-foreground">
            {detail.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function DesignPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "DesignPage" });
  const dataT = locale === "zh-CN" ? await getTranslations({ locale, namespace: "DesignData" }) : null;
  const messages = await getMessages();
  const principlesContent = dataT
    ? principles.map((entry, index) => ({
        title: dataT("principles." + index + ".title"),
        text: dataT("principles." + index + ".text"),
      }))
    : principles;
  const paletteContent = palette.map((entry) => ({
    ...entry,
    role: dataT ? dataT("paletteRoles." + entry.token) : entry.role,
  }));
  const typographyContent = dataT
    ? typography.map(
        (entry, index) =>
          [dataT("typography." + index + ".title"), entry[1], dataT("typography." + index + ".description")] as const,
      )
    : typography;
  const productGuidanceContent = dataT
    ? productGuidance.map(
        (_entry, index) =>
          [
            dataT("products." + index + ".title"),
            dataT("products." + index + ".tone"),
            dataT("products." + index + ".description"),
          ] as const,
      )
    : productGuidance;
  const implementationRulesContent = dataT
    ? implementationRules.map(
        (_entry, index) =>
          [
            dataT("implementationRules." + index + ".title"),
            dataT("implementationRules." + index + ".description"),
          ] as const,
      )
    : implementationRules;
  return (
    <article className="mx-auto grid max-w-4xl gap-12">
      <header>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle asChild>
          <h1>{t.rich("title", { marker: (chunks) => <Marker>{chunks}</Marker> })}</h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("description")}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t("examplesNotice")}</p>
      </header>
      <nav
        aria-label={t("sectionsLabel")}
        className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-sm"
      >
        {/* Keep fragment navigation in the router so Back can restore the guide after visiting a component. */}
        {[
          ["principles", t("principlesNav")],
          ["palette", t("paletteNav")],
          ["type", t("typeNav")],
          ["patterns", t("patternsNav")],
          ["products", t("productsNav")],
          ["adopt", t("adoptNav")],
        ].map(([id, title]) => (
          <Link key={id} href={`#${id}`} className="rounded-chip text-muted-foreground hover:text-foreground">
            {title}
          </Link>
        ))}
      </nav>
      <GuideSection id="principles" title={t("principlesTitle")}>
        <div className="grid gap-6 sm:grid-cols-2">
          {principlesContent.map(({ title, text }, index) => (
            <div key={title}>
              <p className="mb-2 font-mono text-xs text-muted-foreground">0{index + 1}</p>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </GuideSection>
      <GuideSection id="palette" title={t("paletteTitle")}>
        <p className="text-muted-foreground">{t("paletteDescription")}</p>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {paletteContent.map(({ token, value, className, role }) => (
            <div key={token} className="grid content-start gap-2">
              <div aria-hidden="true" className={`h-14 rounded-control border border-border ${className}`} />
              <p className="flex flex-wrap justify-between gap-2 font-mono text-xs">
                <span>{token}</span>
                <span className="text-muted-foreground">{value}</span>
              </p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <StatusLabel tone="success">{t("success")}</StatusLabel>
          <StatusLabel tone="pending">{t("warning")}</StatusLabel>
          <StatusLabel tone="destructive">{t("failure")}</StatusLabel>
          <span className="text-sm text-muted-foreground">{t("statusDescription")}</span>
        </div>
      </GuideSection>
      <GuideSection id="type" title={t("typeTitle")}>
        <Rules rows={typographyContent} />
      </GuideSection>
      <GuideSection id="patterns" title={t("patternsTitle")}>
        <p className="text-muted-foreground">{t("patternsDescription")}</p>
        <div className="grid gap-6">
          <NextIntlClientProvider locale={locale} messages={{ Previews: messages.Previews }}>
            <div className="grid gap-3">
              <h3 className="font-semibold">{t("readingHeading")}</h3>
              <p className="text-sm text-muted-foreground">{t("readingDescription")}</p>
              <ReadingPreview />
            </div>
            <div className="grid gap-3">
              <h3 className="font-semibold">{t("listHeading")}</h3>
              <p className="text-sm text-muted-foreground">{t("listDescription")}</p>
              <DataPreview />
            </div>
            <div className="grid gap-3">
              <h3 className="font-semibold">{t("statusHeading")}</h3>
              <p className="text-sm text-muted-foreground">{t("healthComposition")}</p>
              <StatusPreview />
            </div>
          </NextIntlClientProvider>
        </div>
      </GuideSection>
      <GuideSection id="products" title={t("productsTitle")}>
        <Rules rows={productGuidanceContent} />
      </GuideSection>
      <GuideSection id="implementation" title={t("implementationTitle")}>
        <Rules rows={implementationRulesContent} />
      </GuideSection>
      <GuideSection id="adopt" title={t("adoptTitle")}>
        <CodeBlock code={installCommand("workspace", "item-list")} lang="bash" />
        <ol className="grid list-decimal gap-3 pl-5 text-muted-foreground">
          <li>
            {t.rich("adoptTheme", {
              theme: (chunks) => (
                <Link
                  href={localeHref(locale, "/components/theme")}
                  className="text-foreground underline underline-offset-4"
                >
                  {chunks}
                </Link>
              ),
            })}
          </li>
          <li>
            {t.rich("adoptWorkspace", {
              navigation: (chunks) => <code className="font-mono text-sm text-foreground">{chunks}</code>,
              pane: (chunks) => <code className="font-mono text-sm text-foreground">{chunks}</code>,
            })}
          </li>
          <li>
            {t.rich("adoptSelection", {
              density: (chunks) => <code className="font-mono text-sm text-foreground">{chunks}</code>,
              selected: (chunks) => <code className="font-mono text-sm text-foreground">{chunks}</code>,
            })}
          </li>
          <li>{t("adoptValidation")}</li>
        </ol>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href={localeHref(locale, "/components/workspace")} className="underline underline-offset-4">
            {t("workspaceSource")}
          </Link>
          <Link href={localeHref(locale, "/components/item-list")} className="underline underline-offset-4">
            {t("listSource")}
          </Link>
          <a href="/md/design.md" className="underline underline-offset-4">
            {t("markdownGuide")}
          </a>
        </div>
      </GuideSection>
    </article>
  );
}
