import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow, HeadingMark, SectionTitle } from "@/components/ui/section-heading";
import { catalog, items, setupSteps } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";

export default function OverviewPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-14">
      <header>
        <Eyebrow>{items.length} items</Eyebrow>
        <SectionTitle asChild>
          <h1>
            Abnormal UI<HeadingMark>.</HeadingMark>
          </h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Design tokens, base components and brand pieces shared by the website, onboard and mail. Each one installs as
          source into the project.
        </p>
      </header>

      <section aria-labelledby="start" className="grid gap-5">
        <h2 id="start" className="font-heading text-2xl font-semibold">
          Get started
        </h2>
        <ol className="grid gap-5">
          {setupSteps.map(({ title, code, lang }, index) => (
            <li key={title} className="grid gap-2">
              <p className="text-base font-medium">
                {index + 1}. {title}
              </p>
              <CodeBlock code={code} lang={lang} />
            </li>
          ))}
        </ol>
      </section>

      {catalog.map((group) => (
        <section key={group.title} className="grid gap-4">
          <h2 className="font-heading text-2xl font-semibold">{group.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <Card key={item.name} asChild variant="interactive">
                <Link href={`/components/${item.name}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
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
