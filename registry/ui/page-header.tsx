import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * The top of a page in a product: the title, a line or an ⓘ that says what the page is for, and the page's own actions
 * on the right, with a way back above it on a detail page (PageHeaderBack, or a Breadcrumb in its place).
 * The title is the page's h1 and the actions are 32px controls; on a narrow screen the actions wrap below the title.
 * `sticky` keeps it at the top while the page scrolls under it, on an opaque background spread across the content
 * column. The line under it shows only while the header is stuck, which takes knowing the page has scrolled: set
 * `data-stuck` on it from the page's own scroll state, or leave it without a line.
 */
function PageHeader({ className, sticky = false, ...props }: React.ComponentProps<"header"> & { sticky?: boolean }) {
  return (
    <header
      data-slot="page-header"
      data-sticky={sticky || undefined}
      className={cn(
        "relative isolate flex min-w-0 flex-col gap-2 pb-5",
        sticky &&
          "sticky top-0 z-header pt-5 pb-3 before:absolute before:inset-y-0 before:-inset-x-[100vmax] before:-z-10 before:border-b before:border-transparent before:bg-background before:transition-colors data-stuck:before:border-border",
        className,
      )}
      {...props}
    />
  );
}

/** The row under the way back: the title on the left and the actions on the right. */
function PageHeaderRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-row"
      className={cn("flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-3", className)}
      {...props}
    />
  );
}

/** The title and what sits right beside it, such as an InfoHint with the page's description. */
function PageHeaderHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="page-header-heading" className={cn("flex min-w-0 items-center gap-2", className)} {...props} />
  );
}

/** The page's h1; pass asChild for another element when the page already has one. */
function PageHeaderTitle({ className, asChild = false, ...props }: React.ComponentProps<"h1"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h1";
  return (
    <Comp
      data-slot="page-header-title"
      className={cn("min-w-0 text-3xl font-semibold tracking-[-0.025em] text-pretty wrap-anywhere", className)}
      {...props}
    />
  );
}

/** A line under the row that says what the page is for. For a page that needs no line, put an InfoHint in the heading instead. */
function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("max-w-2xl text-sm text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * The page's own actions. Every link and button in it is 32px tall, whatever size it was given, so the row stays level.
 * They wrap onto a second line when the header is narrow; `scroll` keeps them on one line that scrolls sideways
 * without a scrollbar, for a phone. The row stays markup only, so for its edges to fade where actions are cut off,
 * pass `asChild` with a `ScrollFade` (scroll-area) around the actions: `<PageHeaderActions scroll asChild>
 * <ScrollFade wheel>…</ScrollFade></PageHeaderActions>`.
 */
function PageHeaderActions({
  className,
  scroll = false,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** One line that scrolls sideways instead of wrapping. */
  scroll?: boolean;
  /** Put the row's slot and classes on the child given, such as a ScrollFade. */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="page-header-actions"
      data-scroll={scroll || undefined}
      className={cn(
        "flex min-w-0 items-center gap-2 [&>*]:shrink-0 [&>:is(a,button)]:h-8 [&>:is(a,button)]:text-sm",
        // The focus ring of an action at either end stays inside the scrolling box.
        scroll
          ? "-m-0.5 flex-nowrap overflow-x-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A small link above the title back to the parent page, led by an arrow. The words are the parent's name ("Mailboxes");
 * pass asChild with the router's link.
 */
function PageHeaderBack({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="page-header-back"
      className={cn(
        "-ml-0.5 flex w-fit items-center gap-1.5 rounded-control text-sm text-muted-foreground transition-colors duration-100 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {/* lucide's arrow-left, drawn inline: lucide-react's icon is a client module, and a page header renders on the server. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-3.5 shrink-0"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  );
}

export {
  PageHeader,
  PageHeaderRow,
  PageHeaderHeading,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBack,
};
