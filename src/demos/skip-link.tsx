import { SkipLink } from "@/components/ui/skip-link";

export const defaultCopy = {
  instructions: "Press Tab to bring the link into view, then Enter to jump to the content.",
  skip: "Skip to content",
  content: "The page's content.",
};

export default function SkipLinkDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-3 text-sm text-muted-foreground">
      <p>{copy.instructions}</p>
      <SkipLink href="#skip-link-content">{copy.skip}</SkipLink>
      <div id="skip-link-content" tabIndex={-1} className="rounded-control border border-border p-4 text-foreground">
        {copy.content}
      </div>
    </div>
  );
}
