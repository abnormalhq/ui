import { JsonLd, serializeJsonLd } from "@/components/ui/json-ld";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Abnormal",
  url: "https://abnormalhq.com",
  description: "Mail for teams </script> and nothing else",
};

/* The script element is invisible; the text it carries is shown beside it. */
export default function JsonLdDemo() {
  return (
    <div className="w-full max-w-xl">
      <JsonLd data={organization} />
      <pre className="overflow-x-auto rounded-control bg-surface p-3 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
        {serializeJsonLd(organization)}
      </pre>
    </div>
  );
}
