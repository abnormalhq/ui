import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow, HeadingMark, SectionTitle } from "@/components/ui/section-heading";
import type { Locale } from "@/site/i18n/locales";
import { localeHref } from "@/site/i18n/locale-path";
import { catalog, items, setupSteps } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import { registryCopy } from "@/site/registry-copy";

export default async function OverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Overview" });
  const catalogT = await getTranslations({ locale, namespace: "Catalog" });
  return (
    <div className="mx-auto grid max-w-4xl gap-14">
      <header>
        <Eyebrow>{t("items", { count: items.length })}</Eyebrow>
        <SectionTitle asChild>
          <h1>
            Abnormal UI<HeadingMark>.</HeadingMark>
          </h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("description")}</p>
        <Link
          href={localeHref(locale, "/gallery")}
          className="mt-4 inline-block rounded-control font-medium underline underline-offset-4"
        >
          {t("browseGallery")}
        </Link>
      </header>

      <section aria-labelledby="family-style" className="grid gap-3 border-y border-border py-6">
        <h2 id="family-style" className="font-heading text-2xl font-semibold">
          {t("familyHeading")}
        </h2>
        <p className="max-w-2xl text-muted-foreground">{t("familyDescription")}</p>
        <Link
          href={localeHref(locale, "/design")}
          className="w-fit rounded-control font-medium underline underline-offset-4"
        >
          {t("exploreFamily")}
        </Link>
      </section>

      <section aria-labelledby="start" className="grid gap-5">
        <h2 id="start" className="font-heading text-2xl font-semibold">
          {t("getStarted")}
        </h2>
        <ol className="grid gap-5">
          {setupSteps.map(({ title, code, lang }, index) => (
            <li key={title} className="grid gap-2">
              <p className="text-base font-medium">
                {index + 1}. {catalogT(`setup.${index}`)}
              </p>
              <CodeBlock code={code} lang={lang} />
            </li>
          ))}
        </ol>
      </section>

      {catalog.map((group, index) => (
        <section key={group.title} className="grid gap-4">
          <h2 className="font-heading text-2xl font-semibold">{catalogT(`groups.${index}`)}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <Card key={item.name} asChild variant="interactive">
                <Link href={localeHref(locale, `/components/${item.name}`)}>
                  <CardHeader className="pb-4">
                    {/* Under the group's h2, so each card title is an h3. */}
                    <CardTitle asChild className="text-base font-semibold">
                      <h3>{registryCopy(locale, item).title}</h3>
                    </CardTitle>
                    <CardDescription>{registryCopy(locale, item).description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
