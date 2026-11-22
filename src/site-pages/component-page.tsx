import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Disclosure, DisclosureContent, DisclosureList, DisclosureTrigger } from "@/components/ui/disclosure";
import { Eyebrow, SectionTitle } from "@/components/ui/section-heading";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { catalog, getItem, installCommand } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import type { CodeLang } from "@/site/highlight";
import { designNotes, variantsOf } from "@/site/notes";
import { localizedDesignNotes } from "@/site/i18n/design-notes";
import { registryCopy } from "@/site/registry-copy";

type DemoProps = { copy?: Record<string, string>; locale?: string; hrefPrefix?: string };

export async function componentMetadata(locale: Locale, name: string): Promise<Metadata> {
  const item = getItem(name);
  if (!item) return {};
  const copy = registryCopy(locale, item);
  return { title: copy.title, description: copy.description };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** A note from a source comment, with its `backticked` words set in code. */
function Note({ text }: { text: string }) {
  return (
    <p className="text-pretty text-muted-foreground">
      {text.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith("`") ? (
          <code key={index} className="rounded-chip bg-surface px-1 py-0.5 font-mono text-sm text-foreground">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export default async function ComponentPage({ name, locale }: { name: string; locale: Locale }) {
  const item = getItem(name);
  if (!item) notFound();

  const { default: Demo } = (await import(`../demos/${item.name}.tsx`)) as { default: ComponentType<DemoProps> };
  const groupIndex = catalog.findIndex(({ items: members }) => members.includes(item));
  const t = await getTranslations({ locale, namespace: "ItemPage" });
  const catalogT = await getTranslations({ locale, namespace: "Catalog" });
  const messages = locale === "zh-CN" ? await getMessages({ locale }) : undefined;
  const demoCopy = messages
    ? (messages.Demos as Record<string, Record<string, string>> | undefined)?.[item.name]
    : undefined;
  // Exported at build (dynamicParams is off), so these files are never read at runtime.
  const usage = await readFile(`src/demos/${item.name}.tsx`, "utf8");
  const sources = await Promise.all(item.files.map(async ({ path }) => ({ path, code: await readFile(path, "utf8") })));
  const requires = item.registryDependencies?.map((name) => name.replace("@abnormal/", "")) ?? [];
  const packages = item.dependencies ?? [];
  const code = sources.filter(({ path }) => /\.tsx?$/.test(path));
  const notes = localizedDesignNotes(
    locale,
    item.name,
    code.flatMap(({ code: text }) => designNotes(text)),
  );
  const variants = code.flatMap(({ code: text }) => variantsOf(text));

  return (
    <article className="mx-auto grid max-w-4xl gap-10">
      <header>
        <Eyebrow>{catalogT(`groups.${groupIndex}`)}</Eyebrow>
        <SectionTitle asChild>
          <h1>{registryCopy(locale, item).title}</h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{registryCopy(locale, item).description}</p>
      </header>

      <Section title={t("preview")}>
        {/* Full width on phones: the gutter is the page's, so a table or a card gets the whole screen. */}
        <div className="-mx-4 flex min-h-48 items-center justify-center overflow-x-auto border-y border-border p-4 sm:mx-0 sm:rounded-panel sm:border-x sm:p-5 md:p-10">
          <Demo
            copy={demoCopy}
            locale={locale === "zh-CN" ? "zh-CN" : "en-GB"}
            hrefPrefix={locale === "zh-CN" ? "/zh" : ""}
          />
        </div>
      </Section>

      {notes.length > 0 && (
        <Section title={t("designNotes")}>
          <div className="grid gap-3">
            {notes.map((text) => (
              <Note key={text} text={text} />
            ))}
          </div>
        </Section>
      )}

      {variants.length > 0 && (
        <Section title={t("variants")}>
          <dl className="grid gap-3">
            {variants.map(({ name, options, defaultOption }) => (
              <div key={name} className="grid gap-1.5 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4">
                <dt className="font-mono text-sm">{name}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {options.map((option) => (
                    <Badge
                      key={option}
                      variant={option === defaultOption ? "default" : "outline"}
                      className="font-mono"
                    >
                      {option}
                    </Badge>
                  ))}
                  {defaultOption && <span className="self-center text-xs text-muted-foreground">{t("default")}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section title={t("install")}>
        <CodeBlock code={installCommand(item.name)} lang="bash" />
        {requires.length + packages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span className="mr-1">{t("bringsIn")}</span>
            {requires.map((name) => (
              <Badge key={name} variant="outline" asChild>
                <Link href={localeHref(locale, "/components/" + name)}>{name}</Link>
              </Badge>
            ))}
            {packages.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("usage")}>
        <CodeBlock code={usage} lang="tsx" />
      </Section>

      <DisclosureList>
        {/* An item can bring several files (table brings table-row.ts), and each one is installed. */}
        {sources.map(({ path, code }) => (
          <Disclosure key={path}>
            <DisclosureTrigger>
              <span className="min-w-0 flex-1 font-heading text-xl font-semibold">
                {sources.length > 1 ? t("sourceFile", { filename: basename(path) }) : t("source")}
              </span>
            </DisclosureTrigger>
            <DisclosureContent>
              <CodeBlock code={code} lang={extname(path).slice(1) as CodeLang} />
            </DisclosureContent>
          </Disclosure>
        ))}
      </DisclosureList>
    </article>
  );
}
