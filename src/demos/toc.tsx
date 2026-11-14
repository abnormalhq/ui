import { Toc, TocLink, TocList, TocTitle } from "@/components/ui/toc";

const sections = [
  { id: "toc-setup", title: "Set up the domain" },
  { id: "toc-records", title: "Publish the records", level: 2 as const },
  { id: "toc-verify", title: "Verify" },
  { id: "toc-mailboxes", title: "Create mailboxes" },
];

/* The article's headings carry the ids; the page scrolls, and the table of contents marks the one being read. */
export default function TocDemo() {
  return (
    <div className="grid w-full max-w-xl gap-8 sm:grid-cols-[12rem_1fr]">
      <Toc label="On this page">
        <TocTitle>On this page</TocTitle>
        <TocList>
          {sections.map((section) => (
            <TocLink key={section.id} href={`#${section.id}`} level={section.level}>
              {section.title}
            </TocLink>
          ))}
        </TocList>
      </Toc>
      <article className="grid gap-4 text-sm text-muted-foreground">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id} className="scroll-mt-24 text-base font-medium text-foreground">
              {section.title}
            </h2>
            <p className="mt-1">Each heading is a target of the table of contents beside it.</p>
          </section>
        ))}
      </article>
    </div>
  );
}
