import { readFile } from "node:fs/promises";
import Link from "next/link";
import { getMessages, getTranslations } from "next-intl/server";
import type { ComponentType } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Disclosure, DisclosureContent, DisclosureTrigger } from "@/components/ui/disclosure";
import { Marker } from "@/components/ui/marker";
import { Eyebrow, SectionTitle } from "@/components/ui/section-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { catalog, getItem, items } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import BadgeDemo from "@/site/demos/badge";
import ButtonDemo from "@/site/demos/button";
import SwitchDemo from "@/site/demos/switch";
import { featured, galleryTokens } from "@/site/gallery";
import { registryCopy } from "@/site/registry-copy";

type DemoProps = { copy?: Record<string, string>; locale?: string };
const demos: Record<string, ComponentType<DemoProps>> = {
  button: ButtonDemo,
  badge: BadgeDemo,
  switch: SwitchDemo,
};
const families = [
  { name: "Bricolage Grotesque", utility: "font-heading", sample: "Aa" },
  { name: "Inter", utility: "font-sans", sample: "Ag" },
  { name: "JetBrains Mono", utility: "font-mono", sample: "01" },
];

async function CopyToken({ value }: { value: string }) {
  const t = await getTranslations("Common");
  return (
    <CopyButton
      text={value}
      label={t("copyValue", { value })}
      copiedLabel={t("copied")}
      failedLabel={t("copyFailed")}
    />
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid min-w-0 scroll-mt-20 gap-5">
      <h2 id={`${id}-title`} className="font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function GalleryPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "GalleryPage" });
  const catalogT = await getTranslations({ locale, namespace: "Catalog" });
  const messages = locale === "zh-CN" ? await getMessages({ locale }) : undefined;
  const demoCopies = messages?.Demos as Record<string, Record<string, string>> | undefined;
  const { colors, sizes } = await galleryTokens();
  const examples = await Promise.all(
    featured.map(async (name) => ({
      name,
      title: registryCopy(locale, getItem(name)!).title.replace(/^Abnormal /, ""),
      Demo: demos[name]!,
      copy: demoCopies?.[name],
      source: await readFile(`src/demos/${name}.tsx`, "utf8"),
    })),
  );

  return (
    <article className="mx-auto grid max-w-4xl gap-12">
      <header className="grid gap-6 border-b border-border pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Eyebrow>Abnormal UI</Eyebrow>
          <SectionTitle asChild className="mt-3 md:text-display lg:text-display-lg">
            <h1>{t.rich("title", { marker: (chunks) => <Marker>{chunks}</Marker> })}</h1>
          </SectionTitle>
          <p className="mt-3 max-w-md text-lg text-muted-foreground">{t("description")}</p>
        </div>
        <nav aria-label={t("sectionsLabel")} className="flex flex-wrap gap-x-4 gap-y-2 text-sm sm:grid sm:gap-2">
          {[
            [t("registryCount", { count: items.length }), "#registry"],
            [t("colorTokens"), "#colors"],
            [t("typography"), "#typography"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href!}
              className="w-fit underline decoration-border underline-offset-4 hover:decoration-current"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <Section id="variants" title={t("variants")}>
        <Tabs defaultValue="button" className="gap-0 overflow-hidden rounded-panel border border-border">
          <TabsList aria-label={t("featuredLabel")} variant="pill" className="bg-surface p-2">
            {examples.map(({ name, title }) => (
              <TabsTrigger key={name} value={name}>
                {title}
              </TabsTrigger>
            ))}
          </TabsList>
          {examples.map(({ name, title, Demo, source, copy }) => (
            <TabsContent key={name} value={name}>
              <div className="flex min-h-48 items-center justify-center border-y border-border p-5 sm:p-8 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:14px_14px]">
                <Demo copy={copy} locale={locale === "zh-CN" ? "zh-CN" : "en-GB"} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
                <code className="font-mono text-xs text-muted-foreground">@abnormal/{name}</code>
                <Link href={localeHref(locale, "/components/" + name)} className="text-sm underline underline-offset-4">
                  {t("documentation", { title })}
                </Link>
              </div>
              <Disclosure className="border-0 px-4">
                <DisclosureTrigger className="min-h-11 justify-between py-1 font-medium">
                  {t("usageExample")}
                </DisclosureTrigger>
                <DisclosureContent className="mt-1">
                  <CodeBlock code={source} lang="tsx" />
                </DisclosureContent>
              </Disclosure>
            </TabsContent>
          ))}
        </Tabs>
        <Disclosure id="registry" className="scroll-mt-20 border-t border-border">
          <DisclosureTrigger className="min-h-12 justify-between py-2 font-medium">
            {t("browseItems", { count: items.length })}
          </DisclosureTrigger>
          <DisclosureContent className="mt-3 grid gap-5">
            {catalog.map(({ title, items: members }, index) => (
              <div key={title}>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{catalogT(`groups.${index}`)}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {members.map((item) => (
                    <Link
                      key={item.name}
                      href={localeHref(locale, "/components/" + item.name)}
                      className="text-sm underline underline-offset-4"
                    >
                      {registryCopy(locale, item).title.replace(/^Abnormal /, "")}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </DisclosureContent>
        </Disclosure>
      </Section>

      <Section id="colors" title={t("colorTokens")}>
        <p className="-mt-3 text-muted-foreground">{t("swatches")}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map(({ name, reference, light, dark }) => (
            <div key={name} className="min-w-0">
              <div className="h-14 rounded-control border border-border" style={{ backgroundColor: reference }} />
              <div className="mt-2 flex items-start justify-between gap-1">
                <div className="min-w-0 font-mono text-xs">
                  <p className="font-medium [overflow-wrap:anywhere]">{name}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    <span className="dark:hidden">{light}</span>
                    <span className="hidden dark:inline">{dark}</span>
                  </p>
                </div>
                <CopyToken value={reference} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="typography" title={t("typography")}>
        <div className="grid overflow-hidden rounded-panel border border-border sm:grid-cols-3">
          {families.map(({ name, utility, sample }) => (
            <div
              key={utility}
              className="grid gap-4 border-border bg-surface p-4 max-sm:border-b sm:border-r last:border-0"
            >
              <span aria-hidden="true" className={`${utility} text-display-lg leading-none`}>
                {sample}
              </span>
              <div className="flex items-end justify-between gap-1">
                <div>
                  <h3 className={`${utility} font-semibold`}>{name}</h3>
                  <code className="font-mono text-xs text-muted-foreground">{utility}</code>
                </div>
                <CopyToken value={utility} />
              </div>
            </div>
          ))}
        </div>
        <div className="divide-y divide-border border-y border-border">
          {sizes.map(({ name, size, leading }) => (
            <div
              key={name}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
            >
              <div className="font-mono text-xs">
                <code>{name}</code>
                <p className="text-muted-foreground">
                  {size} / {leading}
                </p>
              </div>
              <p
                style={{ fontSize: size, lineHeight: leading }}
                className={`col-start-1 row-start-2 break-words sm:col-start-2 sm:row-start-1 ${name.startsWith("text-display") ? "font-heading font-semibold" : "font-sans"}`}
              >
                Abnormal UI
              </p>
              <div className="col-start-2 row-start-1 sm:col-start-3">
                <CopyToken value={name} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </article>
  );
}
