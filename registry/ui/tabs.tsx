"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs as TabsPrimitive } from "radix-ui";

/**
 * Views of one subject that swap in place: the sections of a settings page, the folders of a mailbox. The row is a
 * hairline with the tab names on it, and the current one is marked by a 2px bar in the signal color (ink in light,
 * yellow in dark and in the ink shell), so the mark stays visible on any surface.
 * Arrow keys move between tabs and Home and End jump to the ends; a tab opens as it takes focus. Pass
 * activationMode="manual" when showing a panel costs a request, so it opens on Enter or Space instead.
 * Name the list with aria-label or aria-labelledby. For pages with their own URLs use links, not tabs.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex min-w-0 flex-col gap-4 data-[orientation=vertical]:flex-row", className)}
      {...props}
    />
  );
}

/** The row scrolls sideways when the tabs do not fit, without a scrollbar of its own: arrow keys bring a tab into view. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex min-w-0 shrink-0 [scrollbar-width:none] data-[orientation=horizontal]:items-end data-[orientation=horizontal]:gap-1 data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-border data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-border",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // The bar is the trigger's own edge laid over the list's hairline, so nothing moves when the tab changes.
        "relative inline-flex h-9 shrink-0 items-center justify-center gap-1.5 px-2.5 text-base font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 select-none after:absolute after:bg-signal after:opacity-0 after:transition-opacity after:duration-150 hover:text-foreground focus-visible:-outline-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:bottom-0 data-[orientation=horizontal]:after:h-0.5 data-[orientation=vertical]:justify-start data-[orientation=vertical]:px-3.5 data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:w-0.5 data-[state=active]:text-foreground data-[state=active]:after:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** A panel is a tab stop itself, so a keyboard user reaches text that has no control in it. */
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("min-w-0 flex-1", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
