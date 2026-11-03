import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

/**
 * A uniform 32px height and control radius. The primary action is solid ink (weight 600);
 * secondary actions (outline) are a translucent gray background + a very faint border + gray text that brightens on hover; destructive actions are light red with red text.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-control border border-transparent font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 active:scale-[0.98] select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand font-semibold text-brand-foreground hover:bg-brand/85 aria-expanded:bg-brand/85",
        outline:
          "border-input bg-control text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
        secondary: "bg-control text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "text-muted-foreground hover:bg-control hover:text-foreground aria-expanded:bg-control aria-expanded:text-foreground",
        destructive:
          "bg-destructive/15 font-semibold text-destructive hover:bg-destructive/25 aria-expanded:bg-destructive/25",
        link: "h-auto rounded-none border-0 p-0 font-normal text-foreground underline decoration-border underline-offset-4 hover:decoration-current",
      },
      size: {
        default: "h-8 gap-1.5 px-3 text-base",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-base",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
