import type { Metadata } from "next";
import Link from "next/link";
import { Marker } from "@/components/ui/marker";
import { Eyebrow, SectionTitle } from "@/components/ui/section-heading";
import { StatusLabel } from "@/components/ui/status-label";
import { installCommand } from "@/site/catalog";
import { CodeBlock } from "@/site/components/code-block";
import { DataPreview, StatusPreview } from "@/site/components/pattern-previews";
import { ReadingPreview } from "@/site/components/reading-preview";
import { implementationRules, palette, principles, productGuidance, typography } from "@/site/design";

export const metadata: Metadata = {
  title: "Family style",
  description:
    "Paper-like tool minimalism: the shared visual contract and composition examples for the Abnormal family.",
};

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

export default function DesignPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-12">
      <header>
        <Eyebrow>The Abnormal family</Eyebrow>
        <SectionTitle asChild>
          <h1>
            Paper, ink, <Marker>purpose</Marker>.
          </h1>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Paper-like tool minimalism. One shared vocabulary, not one compulsory layout. Let the website have character
          and the workspace stay quiet.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          The existing palette and component defaults stay intact. These foundations guide product-specific adoption;
          the examples below use sample data, not product integrations.
        </p>
      </header>
      <nav
        aria-label="Style guide sections"
        className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-sm"
      >
        {[
          ["principles", "Principles"],
          ["palette", "Palette"],
          ["type", "Type"],
          ["patterns", "Patterns"],
          ["products", "Products"],
          ["adopt", "Adopt"],
        ].map(([id, title]) => (
          <a key={id} href={`#${id}`} className="rounded-chip text-muted-foreground hover:text-foreground">
            {title}
          </a>
        ))}
      </nav>
      <GuideSection id="principles" title="A shared visual contract">
        <div className="grid gap-6 sm:grid-cols-2">
          {principles.map(({ title, text }, index) => (
            <div key={title}>
              <p className="mb-2 font-mono text-xs text-muted-foreground">0{index + 1}</p>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </GuideSection>
      <GuideSection id="palette" title="Keep the palette. Clarify the job.">
        <p className="text-muted-foreground">
          Swatches follow the current theme; hex values are the existing light-theme reference. Use semantic tokens, not
          these hex values in product code.
        </p>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {palette.map(({ token, value, className, role }) => (
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
          <StatusLabel tone="success">Success</StatusLabel>
          <StatusLabel tone="pending">Warning / in progress</StatusLabel>
          <StatusLabel tone="destructive">Failure</StatusLabel>
          <span className="text-sm text-muted-foreground">Status uses words as well as color.</span>
        </div>
      </GuideSection>
      <GuideSection id="type" title="Hierarchy before decoration">
        <Rules rows={typography} />
      </GuideSection>
      <GuideSection id="patterns" title="Compose around the task">
        <p className="text-muted-foreground">
          These are executable component compositions, not replacement product screens. Use the theme switcher above to
          inspect both themes. No product routes or behavior are changed here.
        </p>
        <div className="grid gap-3">
          <h3 className="font-semibold">01 / Reading workspace</h3>
          <p className="text-sm text-muted-foreground">
            A compact list beside a comfortable reader. Select a message to change the reader; saturated yellow marks
            location, muted yellow marks content selection.
          </p>
          <ReadingPreview />
        </div>
        <div className="grid gap-3">
          <h3 className="font-semibold">02 / Operational list</h3>
          <p className="text-sm text-muted-foreground">
            A continuous paper surface, aligned columns and explicit state. Use an inspector only when the workflow
            needs it, not to imitate Mail.
          </p>
          <DataPreview />
        </div>
        <div className="grid gap-3">
          <h3 className="font-semibold">03 / Service health</h3>
          <p className="text-sm text-muted-foreground">
            No compulsory ink shell. Health and history carry the hierarchy; semantic green, amber and red stay
            independent of brand yellow.
          </p>
          <StatusPreview />
        </div>
      </GuideSection>
      <GuideSection id="products" title="Same family, different character">
        <Rules rows={productGuidance} />
      </GuideSection>
      <GuideSection id="implementation" title="Make it hold up in use">
        <Rules rows={implementationRules} />
      </GuideSection>
      <GuideSection id="adopt" title="Adopt without a forced redesign">
        <CodeBlock code={installCommand("workspace", "item-list")} lang="bash" />
        <ol className="grid list-decimal gap-3 pl-5 text-muted-foreground">
          <li>
            Keep the existing{" "}
            <Link href="/components/theme" className="text-foreground underline underline-offset-4">
              theme
            </Link>{" "}
            and fonts. Reinstall item-list only where the new opt-in row styles are needed; its default spacing is
            unchanged.
          </li>
          <li>
            Put <code className="font-mono text-sm text-foreground">WorkspaceNavigation</code> and{" "}
            <code className="font-mono text-sm text-foreground">WorkspacePane</code> beside each other. Pane padding is
            local; product navigation, pane widths and scrolling remain the product&apos;s decision.
          </li>
          <li>
            Use <code className="font-mono text-sm text-foreground">density=&quot;compact&quot;</code> for list spacing
            and <code className="font-mono text-sm text-foreground">selected</code> for the muted row highlight. Supply
            the matching aria-current or aria-pressed semantics in the product.
          </li>
          <li>
            Validate real light / dark, narrow / wide and keyboard / touch flows before rolling out a product. This
            guide does not claim those integrations are done.
          </li>
        </ol>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/components/workspace" className="underline underline-offset-4">
            Workspace source &amp; usage
          </Link>
          <Link href="/components/item-list" className="underline underline-offset-4">
            List source &amp; usage
          </Link>
          <a href="/md/design.md" className="underline underline-offset-4">
            Markdown guide
          </a>
        </div>
      </GuideSection>
    </article>
  );
}
