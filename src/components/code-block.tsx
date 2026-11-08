import { CopyButton } from "@/components/ui/copy-button";
import { type CodeLang, highlight } from "@/site/highlight";

export async function CodeBlock({ code, lang }: { code: string; lang: CodeLang }) {
  return (
    <div className="relative min-w-0 rounded-control border border-border bg-surface">
      {/* Long lines scroll sideways, and a scrolling region has to take focus so the keyboard can scroll it too. */}
      <pre tabIndex={0} className="overflow-x-auto p-3 pr-11 font-mono text-sm/relaxed">
        <code dangerouslySetInnerHTML={{ __html: await highlight(code, lang) }} />
      </pre>
      <CopyButton
        text={code}
        label="Copy"
        copiedLabel="Copied"
        failedLabel="Copy failed"
        className="absolute top-2 right-2 bg-surface"
      />
    </div>
  );
}
