import { Eyebrow, HeadingMark, PageLead, PageTitle, SectionTitle } from "@/components/ui/section-heading";

export const defaultCopy = {
  help: "Help center",
  pageTitle: "Find your answer",
  lead: "Step-by-step guides for setting up, using and managing a mailbox.",
  pricing: "Pricing",
  title: "Pay for what you send",
};

export default function SectionHeadingDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-12">
      {/* An inner page's title is its h1; the demo shows it as a paragraph so the gallery keeps one h1. */}
      <div>
        <Eyebrow>{copy.help}</Eyebrow>
        <PageTitle asChild>
          <p>
            {copy.pageTitle}
            <HeadingMark>.</HeadingMark>
          </p>
        </PageTitle>
        <PageLead>{copy.lead}</PageLead>
      </div>
      <div>
        <Eyebrow>{copy.pricing}</Eyebrow>
        <SectionTitle>
          {copy.title}
          <HeadingMark>.</HeadingMark>
        </SectionTitle>
      </div>
    </div>
  );
}
