import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * A strip across the top of a page or a pane about the state of the whole thing: offline, an auto-reply that is on,
 * maintenance under way. It sits flush against the edges with a line under it, unlike an Alert, which is a block
 * inside the content.
 * `default` is the quiet surface, `highlight` the soft yellow for a state the person turned on themselves,
 * `warning` the amber of something about to happen or under way, `destructive` and `success` the outcome of the
 * whole page. It is a status region, so a screen reader reads it when it appears without interrupting; pass
 * `role="alert"` for one that must interrupt.
 * The text takes the free width and is cut to one line on a narrow pane; a BannerAction and a BannerClose follow it.
 */
const bannerVariants = cva(
  "flex min-w-0 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 text-sm [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        default: "border-border bg-muted text-foreground [&>svg]:text-muted-foreground",
        highlight: "border-border bg-highlight-muted text-foreground",
        warning: "border-badge-ink/25 bg-badge-ink/8 text-foreground [&>svg]:text-badge-ink",
        destructive: "border-destructive/25 bg-destructive/8 text-foreground [&>svg]:text-destructive",
        success: "border-success/25 bg-success/8 text-foreground [&>svg]:text-success",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

function Banner({
  className,
  tone = "default",
  role = "status",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bannerVariants>) {
  return (
    <div
      data-slot="banner"
      data-tone={tone}
      role={role}
      className={cn(bannerVariants({ tone }), className)}
      {...props}
    />
  );
}

/** The one thing the banner says. A word or two can lead it in the tone's color, such as "Maintenance". */
function BannerText({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="banner-text" className={cn("min-w-0 flex-1 truncate", className)} {...props} />;
}

/** A quieter line after the text, such as when it happens. */
function BannerMeta({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="banner-meta"
      className={cn("shrink-0 text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** What to do about it: a small ghost Button or a link, at the end of the strip. */
function BannerAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="banner-action" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />;
}

/**
 * Hides the banner: an icon button named by `label` ("Dismiss"), in the page's language. What hiding means (for this
 * visit, for good) is the page's, so it passes onClick; the button only shows the ×.
 */
function BannerClose({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "aria-label"> & {
  /** The button's accessible name, such as "Dismiss". */
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      data-slot="banner-close"
      className={cn("-my-1 shrink-0", className)}
      {...props}
    >
      {/* lucide's x, drawn inline: lucide-react's icon is a client module, and a banner belongs on pages that ship no script. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </Button>
  );
}

export { Banner, BannerText, BannerMeta, BannerAction, BannerClose, bannerVariants };
