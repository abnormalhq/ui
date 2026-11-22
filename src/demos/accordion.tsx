import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const defaultCopy = {
  forwardingTitle: "Forwarding",
  forwardingBody: "Mail to this address is also delivered to two other mailboxes.",
  automaticReplyTitle: "Automatic reply",
  automaticReplyBody: "Off. Turn it on to answer while you are away.",
  filtersTitle: "Filters",
  filtersBody: "Three rules sort incoming mail into folders.",
};

const sections = [
  { value: "forwarding", title: "forwardingTitle", body: "forwardingBody" },
  { value: "auto-reply", title: "automaticReplyTitle", body: "automaticReplyBody" },
  { value: "filters", title: "filtersTitle", body: "filtersBody" },
] as const;

export default function AccordionDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Accordion type="single" collapsible defaultValue="forwarding" className="w-full max-w-lg">
      {sections.map(({ value, title, body }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{copy[title]}</AccordionTrigger>
          <AccordionContent>{copy[body]}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
