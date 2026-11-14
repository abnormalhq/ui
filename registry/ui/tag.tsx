import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A chip for one value the person chose, with an × that takes it out again: the domains picked in a filter, the
 * addresses of a multi-select. It is a Badge in shape, and grows to wrap a long value rather than cut it.
 * The × is a real button in the tab order, named by `removeLabel`, which the page writes with the value in it
 * ("Remove example.com"), in its language; without `onRemove` there is no button and the tag only shows the value.
 * Moving the focus after a removal (to the next tag, or back to the field) is the page's, since only it knows what
 * comes next. TagList is the list that holds them, named with `aria-label` ("3 domains chosen"); put each Tag in an `li`.
 * `destructive` marks a value that no longer applies, such as a domain that has gone.
 */
const tagVariants = cva(
  "inline-flex max-w-full min-w-0 items-center gap-1 rounded-chip border py-0.5 pl-2 text-xs leading-5 font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-muted text-foreground",
        outline: "border-border bg-card text-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function TagList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="tag-list"
      className={cn("flex min-w-0 flex-wrap gap-1.5 [&>li]:max-w-full [&>li]:min-w-0", className)}
      {...props}
    />
  );
}

function Tag({
  className,
  variant = "default",
  removeLabel,
  onRemove,
  disabled = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof tagVariants> & {
    /** The remove button's accessible name and title, such as "Remove example.com". */
    removeLabel?: string;
    /** Called when the × is pressed; without it there is no button. */
    onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** The × cannot be pressed. */
    disabled?: boolean;
  }) {
  const removable = onRemove !== undefined && removeLabel !== undefined;
  return (
    <span
      data-slot="tag"
      data-variant={variant}
      className={cn(tagVariants({ variant }), removable ? "pr-0.5" : "pr-2", className)}
      {...props}
    >
      <span className="min-w-0 wrap-anywhere">{children}</span>
      {removable && (
        <button
          type="button"
          data-slot="tag-remove"
          aria-label={removeLabel}
          title={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="grid size-5 shrink-0 place-items-center rounded-chip opacity-70 transition-[opacity,background-color] duration-100 hover:bg-control hover:opacity-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <XIcon aria-hidden="true" className="size-3" />
        </button>
      )}
    </span>
  );
}

export { Tag, TagList, tagVariants };
