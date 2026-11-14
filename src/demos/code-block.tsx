import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";

const copy = <CopyButton label="Copy" copiedLabel="Copied" failedLabel="Copy failed" />;

export default function CodeBlockDemo() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <CodeBlock title="Terminal" action={copy}>
        brew install abnormalhq/tap/mail
      </CodeBlock>
      <CodeBlock language="json" aria-label="Request body" action={copy}>
        {`{
  "address": "hello@example.com",
  "quota": 10240
}`}
      </CodeBlock>
    </div>
  );
}
