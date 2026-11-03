import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** A square tile that holds an icon: neutral by default, highlighter yellow for the one item that leads. */
const iconTileVariants = cva("grid shrink-0 place-items-center rounded-control", {
  variants: {
    variant: {
      default: "bg-surface text-foreground",
      highlight: "bg-highlight text-highlight-foreground",
      outline: "border border-border bg-card text-foreground",
    },
    size: {
      sm: "size-8",
      default: "size-11",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function IconTile({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconTileVariants>) {
  return <span data-slot="icon-tile" className={cn(iconTileVariants({ variant, size }), className)} {...props} />;
}

export { IconTile, iconTileVariants };
