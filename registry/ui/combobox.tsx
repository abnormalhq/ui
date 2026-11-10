"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormReset } from "@/components/ui/use-form-reset";

type ComboboxOption = {
  /** What is stored and submitted. */
  value: string;
  /** What is shown and searched. */
  label: string;
  /** Other words that should find the option. */
  keywords?: string[];
  disabled?: boolean;
};

const COMBOBOX_SIZES = {
  sm: "h-7 pr-1.5 pl-2 text-sm",
  default: "h-8 pr-2.5 pl-3 text-base",
  lg: "h-10 pr-3 pl-3.5 text-base",
};

/**
 * A select with a search field, for lists too long to scan: a country, a mailbox, a customer. The button looks like
 * SelectTrigger and opens a popover holding a Command, so the keyboard is the same as there: type to filter, Down
 * and Up to move, Enter to choose, Escape to close; focus then returns to the button.
 * The button is a combobox to assistive technology, one whose popup is a dialog (ARIA 1.2 allows that): its value
 * is the chosen option, so a screen reader reads the field's name and then the choice, and aria-expanded says whether
 * the popover is open. Inside, the search field is the combobox that controls the listbox, and the chosen option
 * carries aria-selected and a check.
 * Every word is the page's: `placeholder` on the button while nothing is chosen, `searchLabel` to name the field and
 * the popover, `searchPlaceholder`, and `emptyMessage` for a search without matches. A combobox takes no name from
 * its content, so give the button one: a Label (`id` and htmlFor), aria-label or aria-labelledby.
 * With a `name` the value submits with a form. Choosing the chosen option again keeps it; pass `clearable` to let
 * that clear the choice instead.
 */
function Combobox({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  searchLabel,
  searchPlaceholder,
  emptyMessage,
  clearable = false,
  name,
  form,
  size = "default",
  className,
  contentClassName,
  align = "start",
  disabled,
  open: openProp,
  onOpenChange,
  renderOption,
  ...props
}: Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "children" | "type"> & {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string;
  /** The new value, or null when a clearable choice was cleared. */
  onValueChange?: (value: string | null) => void;
  /** Shown on the button while nothing is chosen. */
  placeholder: React.ReactNode;
  /** The accessible name of the search field and of the popover. */
  searchLabel: string;
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  emptyMessage: React.ReactNode;
  clearable?: boolean;
  size?: keyof typeof COMBOBOX_SIZES;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** How an option looks in the list and on the button, such as with an icon; the label alone otherwise. */
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}) {
  const [innerValue, setInnerValue] = React.useState<string | null>(defaultValue ?? null);
  // A form reset (a reset button, form.reset(), or the reset React runs after a form action) puts an uncontrolled
  // field back on its default, as it does a native one, unless the page cancels the reset. A controlled field follows
  // its value prop.
  const fieldRef = React.useRef<HTMLInputElement>(null);
  const submits = name !== undefined && !disabled;
  useFormReset(fieldRef, () => setInnerValue(defaultValue ?? null));
  const value = valueProp === undefined ? innerValue : valueProp;
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const chosen = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // PopoverTrigger adds aria-expanded, aria-controls and aria-haspopup="dialog" to the button.
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
          data-slot="combobox-trigger"
          data-size={size}
          data-placeholder={chosen ? undefined : ""}
          disabled={disabled}
          className={cn(
            "flex w-56 min-w-0 items-center justify-between gap-1.5 rounded-control border border-input bg-control text-left text-foreground transition-[border-color,background-color] duration-150 select-none hover:bg-accent focus-visible:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-accent aria-invalid:border-destructive data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
            COMBOBOX_SIZES[size],
            className,
          )}
          {...props}
        >
          <span data-slot="combobox-value" className="flex min-w-0 items-center gap-1.5 truncate">
            {chosen ? (renderOption?.(chosen) ?? chosen.label) : placeholder}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground" aria-hidden="true" />
          {submits && <input ref={fieldRef} type="hidden" name={name} value={value ?? ""} form={form} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={searchLabel}
        align={align}
        className={cn("flex min-w-48 flex-col overflow-hidden p-0", contentClassName)}
      >
        <Command>
          <CommandInput label={searchLabel} placeholder={searchPlaceholder} />
          <CommandList>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                // The search reads the label, which is what people see; the stored value may be an id.
                value={option.label}
                keywords={option.keywords}
                disabled={option.disabled}
                selected={option.value === value}
                className="pr-8"
                onSelect={() => {
                  const next = clearable && option.value === value ? null : option.value;
                  if (next !== value) {
                    if (valueProp === undefined) setInnerValue(next);
                    onValueChange?.(next);
                  }
                  setOpen(false);
                }}
              >
                {renderOption?.(option) ?? option.label}
                {option.value === value && <CheckIcon className="absolute right-2.5" aria-hidden="true" />}
              </CommandItem>
            ))}
          </CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox, type ComboboxOption };
