import { SkipLink } from "@/components/ui/skip-link";

export default function SkipLinkDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3 text-sm text-muted-foreground">
      <p>Press Tab to bring the link into view, then Enter to jump to the content.</p>
      <SkipLink href="#skip-link-content">Skip to content</SkipLink>
      <div id="skip-link-content" tabIndex={-1} className="rounded-control border border-border p-4 text-foreground">
        The page&apos;s content.
      </div>
    </div>
  );
}
