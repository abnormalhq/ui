import { CopyButton } from "@/components/ui/copy-button";

export default function CopyButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="flex items-center gap-1 font-mono text-sm">
        hello@example.com
        <CopyButton text="hello@example.com" label="Copy address" copiedLabel="Copied" failedLabel="Copy failed" />
      </span>
      <CopyButton
        text="https://example.com/invite/8f3k2"
        label="Copy invite link"
        copiedLabel="Copied"
        failedLabel="Copy failed"
        variant="outline"
      >
        Copy link
      </CopyButton>
    </div>
  );
}
