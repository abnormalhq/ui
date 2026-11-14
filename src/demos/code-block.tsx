import { CodeBlock } from "@/components/ui/code-block";

export default function CodeBlockDemo() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <CodeBlock title="Terminal" copyLabel="Copy" copiedLabel="Copied" failedLabel="Copy failed">
        brew install abnormalhq/tap/mail
      </CodeBlock>
      <CodeBlock
        language="json"
        aria-label="Request body"
        copyLabel="Copy"
        copiedLabel="Copied"
        failedLabel="Copy failed"
      >
        {`{
  "address": "hello@example.com",
  "quota": 10240
}`}
      </CodeBlock>
    </div>
  );
}
