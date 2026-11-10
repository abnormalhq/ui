import * as React from "react";
import { EllipsisIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Page links under a list or a table: a navigation landmark with a list of links, so every page has an address,
 * opens in a new tab and works without JavaScript. `label` names the landmark ("Pagination"), in the page's language.
 * Nothing here knows how many pages there are: the page decides which numbers to show and where the gaps go.
 */
function Pagination({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"nav">, "aria-label"> & { label: string }) {
  return (
    <nav data-slot="pagination" aria-label={label} className={cn("flex w-full justify-center", className)} {...props} />
  );
}

function PaginationList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-list" className={cn("flex flex-wrap items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * One page's link, a ghost button in looks. `current` marks the page being shown: aria-current="page" and the soft
 * highlight of a selected row. A bare number tells a screen reader little, so give each link an aria-label such as
 * "Page 3". Pass asChild with the router's link.
 * `disabled` is for Previous on the first page and Next on the last: the link loses its href, which takes it out of
 * the tab order, and is announced as a dimmed link rather than vanishing, so the row does not shift between pages.
 */
function PaginationLink({
  className,
  current = false,
  disabled = false,
  size = "icon",
  asChild = false,
  href,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  current?: boolean;
  disabled?: boolean;
  size?: "default" | "icon";
  asChild?: boolean;
}) {
  const Comp = asChild && !disabled ? Slot.Root : "a";
  // A disabled link goes nowhere, so under asChild the router's link is left out and only its content is kept.
  const content =
    asChild && disabled && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? children.props.children
      : children;
  return (
    <Comp
      data-slot="pagination-link"
      data-current={current || undefined}
      aria-current={current ? "page" : undefined}
      // An anchor without an href is not a link to assistive technology, so the role is spelled out.
      role={disabled ? "link" : undefined}
      aria-disabled={disabled || undefined}
      href={disabled ? undefined : href}
      className={cn(
        buttonVariants({ variant: "ghost", size }),
        "min-w-8 tabular-nums data-current:bg-highlight-muted data-current:text-foreground data-current:hover:bg-highlight-muted",
        size === "icon" && "w-auto px-2",
        className,
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}

/** Previous and Next are PaginationLinks with words in them: pass the words, and an icon if wanted, as children. */
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      size="default"
      className={cn("pl-2 [&>svg]:rtl:rotate-180", className)}
      {...props}
    />
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      data-slot="pagination-next"
      size="default"
      className={cn("pr-2 [&>svg]:rtl:rotate-180", className)}
      {...props}
    />
  );
}

/** A gap in the numbers; `label` says what it stands for ("More pages"). */
function PaginationEllipsis({ label, className, ...props }: React.ComponentProps<"span"> & { label: string }) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn("flex size-8 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <EllipsisIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
