import { CopyButton } from "@/site/components/copy-button";
import { type CodeLang, highlight } from "@/site/highlight";

export async function CodeBlock({ code, lang }: { code: string; lang: CodeLang }) {
  return (
    <div className="relative min-w-0 rounded-control border border-border bg-surface">
      <pre className="overflow-x-auto p-3 pr-11 font-mono text-sm/relaxed">
        <code dangerouslySetInnerHTML={{ __html: await highlight(code, lang) }} />
      </pre>
      <CopyButton code={code} />
    </div>
  );
}
