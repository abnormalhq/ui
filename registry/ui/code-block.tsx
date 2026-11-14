import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

/**
 * Code to read and copy: an install command, a request, a configuration file. A `pre` that scrolls sideways for long
 * lines and takes keyboard focus so it can be scrolled without a pointer, with an optional header line naming it
 * (`title`, such as "Terminal" or a file name) and a copy button in its corner.
 * The copy button copies the code it sits beside, read when pressed, so the code is sent to the page once, even when
 * it arrives highlighted from the server as markup; children are that code, plain text or highlighted spans. Give
 * `copyLabel`, `copiedLabel` and `failedLabel`, the page's words, for the button, and leave them out for none.
 * With a title, the block is a region named by it; without one, name it with `aria-label`. Keep `<code>` out of the
 * title: the button copies the first one in the block.
 */
function CodeBlock({
  title,
  language,
  copyLabel,
  copiedLabel,
  failedLabel,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  /** The header line: what the code is, such as "Terminal" or "components.json". */
  title?: React.ReactNode;
  /** The code's language, written to `data-language` for a highlighter or a style. */
  language?: string;
  /** The copy button's name, such as "Copy"; the button shows when all three labels are given. */
  copyLabel?: string;
  copiedLabel?: string;
  failedLabel?: string;
}) {
  const titleId = React.useId();
  const copy = copyLabel !== undefined && copiedLabel !== undefined && failedLabel !== undefined;
  const named = title !== undefined || ariaLabel !== undefined;
  return (
    <div
      data-slot="code-block"
      className={cn("relative min-w-0 overflow-hidden rounded-control border border-border bg-surface", className)}
      {...props}
    >
      {title !== undefined && (
        <div
          id={titleId}
          data-slot="code-block-title"
          className={cn("border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground", copy && "pr-11")}
        >
          {title}
        </div>
      )}
      <pre
        data-slot="code-block-pre"
        data-language={language}
        tabIndex={0}
        role={named ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={title !== undefined && ariaLabel === undefined ? titleId : undefined}
        className={cn(
          "overflow-x-auto p-3 font-mono text-sm/relaxed text-foreground focus-visible:-outline-offset-2",
          copy && title === undefined && "pr-11",
        )}
      >
        <code>{children}</code>
      </pre>
      {copy && (
        <CopyButton
          label={copyLabel}
          copiedLabel={copiedLabel}
          failedLabel={failedLabel}
          className={cn("absolute right-2 bg-surface", title === undefined ? "top-2" : "top-1.5")}
        />
      )}
    </div>
  );
}

export { CodeBlock };
