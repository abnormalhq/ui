import { Toc, TocLink, TocList, TocTitle } from "@/components/ui/toc";

const sections = [
  { id: "toc-setup", title: "setup" },
  { id: "toc-records", title: "publishRecords", level: 2 as const },
  { id: "toc-verify", title: "verify" },
  { id: "toc-mailboxes", title: "createMailboxes" },
] as const;

export const defaultCopy = {
  setup: "Set up the domain",
  publishRecords: "Publish the records",
  verify: "Verify",
  createMailboxes: "Create mailboxes",
  onThisPage: "On this page",
  description: "Each heading is a target of the table of contents beside it.",
};

/* The article's headings carry the ids; the page scrolls, and the table of contents marks the one being read. */
export default function TocDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-xl gap-8 sm:grid-cols-[12rem_1fr]">
      <Toc label={copy.onThisPage}>
        <TocTitle>{copy.onThisPage}</TocTitle>
        <TocList>
          {sections.map((section) => (
            <TocLink key={section.id} href={`#${section.id}`} level={"level" in section ? section.level : undefined}>
              {copy[section.title]}
            </TocLink>
          ))}
        </TocList>
      </Toc>
      <article className="grid gap-4 text-sm text-muted-foreground">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id} className="scroll-mt-24 text-base font-medium text-foreground">
              {copy[section.title]}
            </h2>
            <p className="mt-1">{copy.description}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
