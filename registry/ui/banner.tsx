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
 * `panel` is the same message as a block of its own, rounded and bordered all round, in larger type: the verdict at
 * the top of a status page, where the tint is the signal. BannerDot leads it with a dot in the tone's color.
 * Icons come in as children: the banner imports none, so a page that shows one ships no script for it.
 */
const bannerVariants = cva(
  "group/banner flex min-w-0 shrink-0 flex-wrap items-center gap-x-3 text-foreground [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        strip: "gap-y-1 border-b px-4 py-2 text-sm",
        panel: "justify-between gap-x-4 gap-y-1 rounded-panel border px-5 py-4 text-base",
      },
      tone: {
        default: "border-border bg-muted [&>svg]:text-muted-foreground",
        highlight: "border-border bg-highlight-muted",
        warning: "bg-badge-ink/8 [&>svg]:text-badge-ink",
        destructive: "bg-destructive/8 [&>svg]:text-destructive",
        success: "bg-success/8 [&>svg]:text-success",
      },
    },
    compoundVariants: [
      { variant: "strip", tone: "warning", className: "border-badge-ink/25" },
      { variant: "strip", tone: "destructive", className: "border-destructive/25" },
      { variant: "strip", tone: "success", className: "border-success/25" },
      { variant: "panel", tone: "default", className: "bg-muted/40" },
      { variant: "panel", tone: "warning", className: "border-badge-ink/40" },
      { variant: "panel", tone: "destructive", className: "border-destructive/50" },
      { variant: "panel", tone: "success", className: "border-success/40" },
    ],
    defaultVariants: { variant: "strip", tone: "default" },
  },
);

function Banner({
  className,
  variant = "strip",
  tone = "default",
  role = "status",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bannerVariants>) {
  return (
    <div
      data-slot="banner"
      data-variant={variant}
      data-tone={tone}
      role={role}
      className={cn(bannerVariants({ variant, tone }), className)}
      {...props}
    />
  );
}

/**
 * The one thing the banner says. A word or two can lead it in the tone's color, such as "Maintenance". In a panel it
 * is the verdict, in larger type, and wraps rather than being cut.
 */
function BannerText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="banner-text"
      className={cn(
        "min-w-0 flex-1 truncate group-data-[variant=panel]/banner:flex group-data-[variant=panel]/banner:items-center group-data-[variant=panel]/banner:gap-2 group-data-[variant=panel]/banner:text-lg group-data-[variant=panel]/banner:font-medium group-data-[variant=panel]/banner:whitespace-normal",
        className,
      )}
      {...props}
    />
  );
}

/** A dot in the banner's tone, before the text or inside it: the status at a glance. Decoration, as the words say it. */
function BannerDot({ className, ...props }: Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="banner-dot"
      aria-hidden="true"
      className={cn(
        "size-2 shrink-0 rounded-full bg-muted-foreground group-data-[variant=panel]/banner:size-2.5 group-data-[tone=destructive]/banner:bg-destructive group-data-[tone=highlight]/banner:bg-signal group-data-[tone=success]/banner:bg-success group-data-[tone=warning]/banner:bg-badge-ink",
        className,
      )}
      {...props}
    />
  );
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

export { Banner, BannerText, BannerDot, BannerMeta, BannerAction, BannerClose, bannerVariants };
