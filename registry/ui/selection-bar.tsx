import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * The strip above a list that acts on the rows checked in it: a checkbox that checks every row listed, how many are
 * checked, what can be done to them, and a way to clear the choice. It is a toolbar, named by `label` ("Selected
 * mailboxes"), in the page's language.
 * The checkbox shows all, none or some (a dash) from `selected` and `total`, and hands the click to `onSelectAll`:
 * true to check every row, false to clear them. `count` is the words for how many are checked ("3 selected"), built by
 * the page for its language's plurals; while nothing is checked, `idle` takes its place, such as the list's filter
 * tabs, so the bar and the checkbox share one row. The actions (children) show only while something is checked.
 * The count is also a status region, so a screen reader hears it change.
 * It takes handlers from the page, so it is rendered by a Client Component; it keeps no state of its own.
 */
function SelectionBar({
  label,
  selectAllLabel,
  selected,
  total,
  onSelectAll,
  count,
  idle,
  clearLabel,
  onClear,
  disabled = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "role" | "aria-label"> & {
  /** The toolbar's accessible name, such as "Selected messages". */
  label: string;
  /** The checkbox's accessible name, such as "Select all on this page". */
  selectAllLabel: string;
  /** Rows checked. */
  selected: number;
  /** Rows listed, which the checkbox checks all of. */
  total: number;
  onSelectAll: (checked: boolean) => void;
  /** How many are checked, in words: "3 selected". */
  count: React.ReactNode;
  /** What shows beside the checkbox while nothing is checked; the select-all name by default. */
  idle?: React.ReactNode;
  /** The clear button's accessible name, such as "Clear selection"; with onClear, the button shows while something is checked. */
  clearLabel?: string;
  onClear?: () => void;
  /** Nothing can be checked or done now, such as while the rows listed are being replaced. */
  disabled?: boolean;
}) {
  const some = selected > 0;
  const checked = !some ? false : selected >= total ? true : "indeterminate";
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-slot="selection-bar"
      data-selected={some || undefined}
      className={cn(
        "flex min-h-11 min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 rounded-panel border border-border bg-card px-4 py-1.5 text-sm data-selected:bg-muted",
        className,
      )}
      {...props}
    >
      <Checkbox
        checked={checked}
        disabled={disabled || total === 0}
        onCheckedChange={(next) => onSelectAll(next === true)}
        aria-label={selectAllLabel}
        className="mr-1"
      />
      {some ? (
        <span data-slot="selection-bar-count" aria-hidden="true" className="mr-1 tabular-nums">
          {count}
        </span>
      ) : (
        <span data-slot="selection-bar-idle" className="min-w-0 flex-1">
          {idle ?? (
            // The checkbox already carries these words as its name.
            <span aria-hidden="true" className="text-muted-foreground">
              {selectAllLabel}
            </span>
          )}
        </span>
      )}
      {some && (
        <>
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
          <div data-slot="selection-bar-actions" className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {children}
          </div>
          {onClear && clearLabel !== undefined && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={clearLabel}
              title={clearLabel}
              disabled={disabled}
              onClick={onClear}
              className="ml-auto"
            >
              <XIcon />
            </Button>
          )}
        </>
      )}
      {/* The count, said whenever it changes: a region that is there from the start, so the first check is heard too. */}
      <span role="status" className="sr-only">
        {some ? count : null}
      </span>
    </div>
  );
}

export { SelectionBar };
