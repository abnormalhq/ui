"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CommandFilter = (item: { value: string; keywords: string[] }, search: string) => boolean;

type CommandContextValue = {
  search: string;
  setSearch: (search: string) => void;
  matches: (item: { value: string; keywords: string[] }) => boolean;
  listId: string;
  activeId: string | undefined;
  setActiveId: (id: string | undefined) => void;
  root: React.RefObject<HTMLDivElement | null>;
};

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand(part: string) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error(`${part} must be used inside Command`);
  return context;
}

const OPTION = '[role="option"]:not([aria-disabled="true"])';

// Every word typed has to appear in the item's value or keywords, in any order and whatever the case.
const containsEveryWord: CommandFilter = ({ value, keywords }, search) => {
  const haystack = [value, ...keywords].join(" ").toLocaleLowerCase();
  return search
    .toLocaleLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
};

/**
 * A search field over a list of options, driven from the keyboard: a command palette in a dialog, the list of a
 * Combobox in a popover, or a filterable list set into a page.
 * Focus stays in the field. Down and Up move the highlighted option and wrap at the ends, Enter runs it, and typing
 * filters the list and puts the highlight back on the first match. The field is a combobox that controls a listbox:
 * aria-activedescendant names the highlighted option, so a screen reader follows the highlight without focus leaving
 * the field. aria-selected is on the option the caller marks `selected`, or on the highlighted one where no option
 * is marked.
 * Filtering matches every typed word against an item's `value` and `keywords`, without case. Pass `filter` for
 * another rule, or shouldFilter={false} when the page filters (a search on the server) and renders only the results.
 * `search` and `onSearchChange` hand the page what was typed. CommandEmpty shows whatever it is given while there is
 * no option, so the same place can say that a search is still running.
 * No package is behind it: the pattern is one field, one list and a highlight, and owning it keeps every word and
 * role in the page's hands.
 */
function Command({
  className,
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  shouldFilter = true,
  filter = containsEveryWord,
  ...props
}: React.ComponentProps<"div"> & {
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  /** False when the page filters and renders only what matches. */
  shouldFilter?: boolean;
  /** Whether an item matches what was typed. */
  filter?: CommandFilter;
}) {
  const [inner, setInner] = React.useState(defaultSearch);
  const search = searchProp ?? inner;
  const [activeId, setActiveId] = React.useState<string>();
  const root = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();
  const trimmed = search.trim();

  const context = React.useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch: (next) => {
        if (searchProp === undefined) setInner(next);
        onSearchChange?.(next);
      },
      matches: (item) => !shouldFilter || trimmed === "" || filter(item, trimmed),
      listId,
      activeId,
      setActiveId,
      root,
    }),
    [search, searchProp, onSearchChange, shouldFilter, trimmed, filter, listId, activeId],
  );

  // The highlight belongs on an option that is there: the first one after the list changes under it.
  React.useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const sync = () => {
      const options = [...element.querySelectorAll<HTMLElement>(OPTION)];
      setActiveId((current) => (options.some(({ id }) => id === current) ? current : options[0]?.id));
    };
    sync();
    // Options also come and go without this component rendering, such as results arriving in a child.
    const observer = new MutationObserver(sync);
    observer.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-disabled"] });
    return () => observer.disconnect();
  }, []);
  // A new search starts again from the first match. Not on mount: a list that opens keeps the highlight on its choice.
  const searched = React.useRef(trimmed);
  React.useLayoutEffect(() => {
    if (searched.current === trimmed) return;
    searched.current = trimmed;
    setActiveId(root.current?.querySelector<HTMLElement>(OPTION)?.id);
  }, [trimmed]);

  return (
    <CommandContext.Provider value={context}>
      <div
        ref={root}
        data-slot="command"
        className={cn("flex min-h-0 w-full flex-col overflow-hidden text-foreground", className)}
        {...props}
      />
    </CommandContext.Provider>
  );
}

/**
 * The search field. `label` is its accessible name ("Search commands"); the placeholder is not one.
 * Home and End stay with the text, as in any field.
 */
function CommandInput({
  className,
  label,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "role" | "aria-label"> & { label: string }) {
  const { search, setSearch, listId, activeId, setActiveId, root } = useCommand("CommandInput");

  const move = (step: 1 | -1) => {
    const options = [...(root.current?.querySelectorAll<HTMLElement>(OPTION) ?? [])];
    if (options.length === 0) return;
    const index = options.findIndex(({ id }) => id === activeId);
    const next =
      options[index === -1 ? (step === 1 ? 0 : options.length - 1) : (index + step + options.length) % options.length]!;
    setActiveId(next.id);
    next.scrollIntoView?.({ block: "nearest" });
  };

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3"
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        data-slot="command-input"
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={search}
        // 16px on phones, as the theme does for Input, so iOS does not zoom the page on focus.
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 max-sm:text-lg",
          className,
        )}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          // Enter while an input method is composing confirms the composition, not the option.
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            move(event.key === "ArrowDown" ? 1 : -1);
          } else if (event.key === "Enter" && activeId) {
            event.preventDefault();
            document.getElementById(activeId)?.click();
          }
        }}
        {...props}
      />
    </div>
  );
}

/** The listbox. It scrolls on its own, so the field stays in view, and takes no room while nothing matches. */
function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  const { listId } = useCommand("CommandList");
  return (
    <div
      id={listId}
      role="listbox"
      data-slot="command-list"
      className={cn(
        "max-h-72 min-h-0 scroll-py-1.5 overflow-x-hidden overflow-y-auto p-1.5 not-has-[[role=option]]:hidden",
        className,
      )}
      {...props}
    />
  );
}

/**
 * What to say when nothing matches, in the page's words. Put it after CommandList, not inside: a listbox may only
 * hold options. It is a status region that is always there, so the message is announced when it arrives.
 */
function CommandEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const { root, search } = useCommand("CommandEmpty");
  const [empty, setEmpty] = React.useState(false);
  React.useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const sync = () => setEmpty(element.querySelector('[role="option"]') === null);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root, search]);
  return (
    <div
      role="status"
      data-slot="command-empty"
      className={cn("px-3 py-6 text-center text-sm text-muted-foreground empty:hidden", className)}
      {...props}
    >
      {empty ? children : null}
    </div>
  );
}

/** Options under a heading, which names the group. A group with no match is hidden with its heading. */
function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "role"> & { heading?: React.ReactNode }) {
  const headingId = React.useId();
  return (
    <div
      role="group"
      aria-labelledby={heading === undefined ? undefined : headingId}
      data-slot="command-group"
      className={cn("not-has-[[role=option]]:hidden", className)}
      {...props}
    >
      {heading !== undefined && (
        <div
          id={headingId}
          aria-hidden="true"
          data-slot="command-group-heading"
          className="px-2 py-1 text-xs text-muted-foreground"
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * One option. `value` is what the search matches and what `onSelect` receives; give `keywords` for other words that
 * should find it. `selected` marks the option that is the current choice of a select-like list; the highlight starts
 * on it.
 * An option that does not match is not rendered.
 */
function CommandItem({
  className,
  value,
  keywords,
  disabled = false,
  selected,
  onSelect,
  onClick,
  onPointerMove,
  id: idProp,
  ...props
}: Omit<React.ComponentProps<"div">, "role" | "onSelect"> & {
  value: string;
  keywords?: string[];
  disabled?: boolean;
  selected?: boolean;
  onSelect?: (value: string) => void;
}) {
  const { matches, activeId, setActiveId } = useCommand("CommandItem");
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const element = React.useRef<HTMLDivElement>(null);
  // A list that opens on a choice starts with the highlight there, and with that option in view.
  React.useLayoutEffect(() => {
    if (!selected || disabled || !element.current) return;
    setActiveId(id);
    element.current.scrollIntoView?.({ block: "nearest" });
    // Only when the option mounts: afterwards the highlight is the user's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!matches({ value, keywords: keywords ?? [] })) return null;
  const active = activeId === id;
  return (
    <div
      ref={element}
      id={id}
      role="option"
      aria-selected={selected ?? active}
      aria-disabled={disabled || undefined}
      data-slot="command-item"
      data-active={active || undefined}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-control px-2.5 py-2 text-base select-none aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-accent data-active:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      // The highlight follows the pointer only when it moves, so a list scrolling under a resting pointer keeps it.
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && !active) setActiveId(id);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled && !event.defaultPrevented) onSelect?.(value);
      }}
      {...props}
    />
  );
}

/** A hairline between groups. It is decoration, and goes away while a search is filtering the groups around it. */
function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { search } = useCommand("CommandSeparator");
  if (search.trim() !== "") return null;
  return (
    <div
      aria-hidden="true"
      data-slot="command-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}

/** A key hint at the end of an option, hidden from assistive technology: it is a reminder, not part of the name. */
function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      aria-hidden="true"
      className={cn("ml-auto font-mono text-xs tracking-wide text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
