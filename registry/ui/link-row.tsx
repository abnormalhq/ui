"use client";

import * as React from "react";
import { TableRow } from "@/components/ui/table";
import { rowClickHandler } from "@/components/ui/table-row";

/**
 * A table row that opens a page when clicked anywhere on it. The row must still hold a real link to the same
 * address: that is what the keyboard, screen readers and a middle click use. This only adds "clicking the blank
 * part also enters", and with Ctrl, Cmd or Shift held it opens a new tab, as the link would.
 * `navigate` is the page's router (such as router.push); without one the browser loads the address.
 */
function LinkRow({
  href,
  navigate,
  ...props
}: React.ComponentProps<typeof TableRow> & { href: string; navigate?: (href: string) => void }) {
  return (
    <TableRow
      {...props}
      onClick={rowClickHandler((event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) window.open(href, "_blank", "noopener");
        else if (navigate) navigate(href);
        else window.location.assign(href);
      })}
    />
  );
}

export { LinkRow };
