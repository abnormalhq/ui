import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sections = [
  { value: "forwarding", title: "Forwarding", body: "Mail to this address is also delivered to two other mailboxes." },
  { value: "auto-reply", title: "Automatic reply", body: "Off. Turn it on to answer while you are away." },
  { value: "filters", title: "Filters", body: "Three rules sort incoming mail into folders." },
];

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="forwarding" className="w-full max-w-lg">
      {sections.map(({ value, title, body }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
