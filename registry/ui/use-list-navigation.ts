import { useEffect, useRef, type RefObject } from "react";

/*
 * Single-key navigation for a list with one current row, the row whose details show beside it: J and K move the
 * current row, Enter or O opens it, Escape lets go of it and "/" goes to the list's search. A file without
 * "use client", so a project's own list calls it; it renders nothing and brings no copy.
 */

type ListNavigationKeys = {
  next: readonly string[];
  previous: readonly string[];
  open: readonly string[];
  close: readonly string[];
  search: readonly string[];
};

const defaultKeys: ListNavigationKeys = {
  next: ["j"],
  previous: ["k"],
  open: ["Enter", "o"],
  close: ["Escape"],
  search: ["/"],
};

type ListNavigationOptions = {
  /** How many rows the list shows now. */
  count: number;
  /** The current row, or -1 when there is none. */
  index: number;
  /** A key moved the current row; the page selects it, and usually scrolls it into view. */
  onIndexChange: (index: number) => void;
  /** Enter or O on the current row. */
  onOpen?: (index: number) => void;
  /** Escape: the page closes the details, or clears the current row. */
  onClose?: () => void;
  /**
   * J past the last row (1) or K before the first (-1): the page can load the next or the previous page. Without it the
   * current row stays where it is.
   */
  onBoundary?: (direction: 1 | -1) => void;
  /** The list's search field, focused (and its text selected) by "/". */
  searchRef?: RefObject<HTMLInputElement | null>;
  /** Other keys than the defaults, each a KeyboardEvent.key. */
  keys?: Partial<ListNavigationKeys>;
  /** Off while the list is not the thing on screen, such as behind a full-page form. */
  enabled?: boolean;
};

/** Typing, a menu or a dialog owns the keys: a letter there is a letter, and Escape closes that, not the list's row. */
const OWNED_BY_TARGET =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), dialog, [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="combobox"]';

/** Enter on a link, a button or a summary activates it; the list's own Enter only applies where it would do nothing. */
const ACTIVATES_ON_ENTER = 'a[href], button, summary, [role="button"], [role="link"], [role="checkbox"], [role="tab"]';

/**
 * Listens on the document, so the keys work wherever the focus is on the page except where they mean something else:
 * in a field, a dialog or a menu, with a modifier held (⌘J stays the browser's), or in the middle of an IME
 * composition. The page keeps the current row in its own state, often its address, and passes it back as `index`.
 * Give the list a visible hint of the keys (a status bar or the empty state) and keep every action reachable by Tab
 * and the pointer as well: these keys are a shortcut, not the only way.
 */
function useListNavigation({
  count,
  index,
  onIndexChange,
  onOpen,
  onClose,
  onBoundary,
  searchRef,
  keys,
  enabled = true,
}: ListNavigationOptions) {
  // The latest values, read by one listener that is added once per `enabled`.
  const latest = useRef({ count, index, onIndexChange, onOpen, onClose, onBoundary, searchRef, keys });
  useEffect(() => {
    latest.current = { count, index, onIndexChange, onOpen, onClose, onBoundary, searchRef, keys };
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      // isContentEditable also covers an element that inherits editing from an ancestor (and "plaintext-only").
      if (target?.closest(OWNED_BY_TARGET) || (target instanceof HTMLElement && target.isContentEditable)) return;
      const current = latest.current;
      const map = { ...defaultKeys, ...current.keys };
      const key = event.key;
      const is = (names: readonly string[]) => names.includes(key);

      if (is(map.search) && current.searchRef?.current) {
        event.preventDefault();
        current.searchRef.current.focus();
        current.searchRef.current.select();
        return;
      }
      if (is(map.next) || is(map.previous)) {
        if (current.count === 0) return;
        event.preventDefault();
        const direction = is(map.next) ? 1 : -1;
        const next = current.index < 0 ? (direction === 1 ? 0 : current.count - 1) : current.index + direction;
        if (next < 0 || next >= current.count) current.onBoundary?.(direction);
        else current.onIndexChange(next);
        return;
      }
      if (is(map.open) && current.onOpen && current.index >= 0 && current.index < current.count) {
        if (key === "Enter" && target?.closest(ACTIVATES_ON_ENTER)) return;
        event.preventDefault();
        current.onOpen(current.index);
        return;
      }
      if (is(map.close) && current.onClose) {
        current.onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}

export { useListNavigation, type ListNavigationKeys, type ListNavigationOptions };
