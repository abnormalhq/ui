import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";

export const defaultCopy = {
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Copy failed",
  terminal: "Terminal",
  requestBody: "Request body",
};

export default function CodeBlockDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const copyAction = <CopyButton label={copy.copy} copiedLabel={copy.copied} failedLabel={copy.copyFailed} />;
  return (
    <div className="grid w-full max-w-lg gap-4">
      <CodeBlock title={copy.terminal} action={copyAction}>
        brew install abnormalhq/tap/mail
      </CodeBlock>
      <CodeBlock language="json" aria-label={copy.requestBody} action={copyAction}>
        {`{
  "address": "hello@example.com",
  "quota": 10240
}`}
      </CodeBlock>
    </div>
  );
}
