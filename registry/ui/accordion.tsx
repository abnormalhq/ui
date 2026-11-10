"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion as AccordionPrimitive } from "radix-ui";

/**
 * Sections of one screen that open in place, as a group: type="single" keeps one open at a time (add `collapsible`
 * to let it close again), type="multiple" lets several stay open. Up and Down move between the headers, Home and
 * End jump to the first and last, and each header is a real heading with a button in it.
 * It is the grouped counterpart of Disclosure, and draws the same row: hairlines between the items and a plus that
 * turns into a close mark. Disclosure is a native <details> that works without JavaScript and suits a list of
 * questions on a page; reach for Accordion when the group needs one-open-at-a-time, arrow keys or state the page
 * controls. Rows are 44px, sized for a product screen rather than a marketing page.
 */
function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root data-slot="accordion" className={cn("border-t border-border", className)} {...props} />
  );
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

/**
 * The header row. It is an h3 unless `heading` names another level to fit the page's outline.
 * `indicator` replaces the plus; style it with `group-data-[state=open]/trigger:` to follow the open state.
 */
function AccordionTrigger({
  className,
  children,
  heading: Heading = "h3",
  indicator,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  heading?: "h2" | "h3" | "h4" | "h5" | "h6";
  indicator?: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Header asChild>
      <Heading data-slot="accordion-header" className="flex font-sans tracking-normal">
        <AccordionPrimitive.Trigger
          data-slot="accordion-trigger"
          className={cn(
            "group/trigger flex min-h-11 flex-1 items-center gap-3 py-2 text-left text-base font-medium text-foreground select-none disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          {...props}
        >
          <span className="min-w-0 flex-1">{children}</span>
          {indicator ?? (
            <span className="grid size-7 shrink-0 place-items-center rounded-control text-muted-foreground transition-[background-color,color] duration-150 group-hover/trigger:bg-control group-hover/trigger:text-foreground group-data-[state=open]/trigger:bg-control group-data-[state=open]/trigger:text-foreground">
              <PlusIcon
                className="size-4 transition-transform duration-150 group-data-[state=open]/trigger:rotate-45"
                aria-hidden="true"
              />
            </span>
          )}
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  );
}

/** The panel is a region named by its header. It opens to its measured height; the padding sits inside, so the motion does not jump. */
function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-open:animate-expand data-closed:animate-collapse"
      {...props}
    >
      <div className={cn("pt-1 pb-4 text-base text-muted-foreground", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
