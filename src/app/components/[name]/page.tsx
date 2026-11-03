import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Disclosure, DisclosureContent, DisclosureList, DisclosureTrigger } from "@/components/ui/disclosure";
import { Eyebrow, SectionTitle } from "@/components/ui/section-heading";
import { catalog, getItem, installCommand, items } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import type { CodeLang } from "@/site/highlight";

type Props = { params: Promise<{ name: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return items.map(({ name }) => ({ name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItem((await params).name);
  return item ? { title: item.title, description: item.description } : {};
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function ItemPage({ params }: Props) {
  const item = getItem((await params).name);
  if (!item) notFound();

  const { default: Demo } = (await import(`../../../demos/${item.name}.tsx`)) as { default: ComponentType };
  const group = catalog.find(({ items: members }) => members.includes(item))!;
  // Exported at build (dynamicParams is off), so these files are never read at runtime.
  const usage = await readFile(`src/demos/${item.name}.tsx`, "utf8");
  const sourcePath = item.files[0]!.path;
  const source = await readFile(sourcePath, "utf8");
  const requires = item.registryDependencies?.map((name) => name.replace("@abnormal/", "")) ?? [];
  const packages = item.dependencies ?? [];

  return (
    <article className="mx-auto grid max-w-4xl gap-10">
      <header>
        <Eyebrow>{group.title}</Eyebrow>
        <SectionTitle asChild>
          <h1>{item.title}</h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{item.description}</p>
      </header>

      <Section title="Preview">
        <div className="flex min-h-48 items-center justify-center rounded-panel border border-border p-5 md:p-10">
          <Demo />
        </div>
      </Section>

      <Section title="Install">
        <CodeBlock code={installCommand(item.name)} lang="bash" />
        {requires.length + packages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span className="mr-1">Brings in</span>
            {requires.map((name) => (
              <Badge key={name} variant="outline" asChild>
                <Link href={`/components/${name}`}>{name}</Link>
              </Badge>
            ))}
            {packages.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        )}
      </Section>

      <Section title="Usage">
        <CodeBlock code={usage} lang="tsx" />
      </Section>

      <DisclosureList>
        <Disclosure>
          <DisclosureTrigger>
            <span className="min-w-0 flex-1 font-heading text-xl font-semibold">Source</span>
          </DisclosureTrigger>
          <DisclosureContent>
            <CodeBlock code={source} lang={extname(sourcePath).slice(1) as CodeLang} />
          </DisclosureContent>
        </Disclosure>
      </DisclosureList>
    </article>
  );
}
