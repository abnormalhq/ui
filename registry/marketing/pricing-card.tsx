import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Marker } from "@/components/ui/marker";

/**
 * One plan on a pricing page: its name, its price and period, what it includes, and the button that starts it.
 * Cards in a row line up: the feature list takes the spare height, so every call to action sits on the same line
 * whatever the number of features.
 * `featured` is for the one plan the page recommends. Its border is the deepened one of a featured Card and its
 * price takes the Marker, the highlighter stroke, which the brand allows once on a screen, so feature one plan, not
 * two. `badge` adds a word for it ("Most popular") as a highlighter chip beside the name.
 * `price` is text the page has already formatted ("$12", "Free", "12 €"): currency and number format belong to the
 * page's locale. `period` is the unit after it ("per mailbox / month"). The name is an h3 unless `heading` names
 * another level. Children are the feature list, and `action` the call to action, usually a Button.
 */
function PricingCard({
  name,
  price,
  period,
  description,
  badge,
  action,
  featured = false,
  heading: Heading = "h3",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Card>, "variant" | "asChild"> & {
  name: React.ReactNode;
  price: React.ReactNode;
  period?: React.ReactNode;
  /** A line under the name: who the plan is for. */
  description?: React.ReactNode;
  /** A word for the featured plan, such as "Most popular". */
  badge?: React.ReactNode;
  /** The call to action. */
  action?: React.ReactNode;
  featured?: boolean;
  heading?: "h2" | "h3" | "h4";
}) {
  return (
    <Card
      data-slot="pricing-card"
      data-featured={featured || undefined}
      variant={featured ? "featured" : "default"}
      className={cn("gap-5 p-5", className)}
      {...props}
    >
      <div data-slot="pricing-card-header" className="grid gap-1">
        <div className="flex min-h-6 items-center justify-between gap-2">
          <Heading data-slot="pricing-card-name" className="text-lg font-semibold">
            {name}
          </Heading>
          {badge !== undefined && <Badge variant="brand">{badge}</Badge>}
        </div>
        {description !== undefined && (
          <p data-slot="pricing-card-description" className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <p data-slot="pricing-card-price" className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-heading text-display-sm leading-none font-semibold tracking-[-0.03em]">
          {featured ? <Marker>{price}</Marker> : price}
        </span>
        {period !== undefined && <span className="text-sm text-muted-foreground">{period}</span>}
      </p>
      <div data-slot="pricing-card-features" className="flex-1">
        {children}
      </div>
      {action !== undefined && (
        <div data-slot="pricing-card-action" className="grid *:w-full">
          {action}
        </div>
      )}
    </Card>
  );
}

function PricingCardFeatures({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pricing-card-feature-list" className={cn("grid gap-2.5 text-base", className)} {...props} />;
}

/** One thing the plan includes, led by a check. The check is decoration: the list already says these are included. */
function PricingCardFeature({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pricing-card-feature" className={cn("flex items-start gap-2.5", className)} {...props}>
      <span className="grid h-[1.5em] w-4 shrink-0 place-items-center" aria-hidden="true">
        <CheckIcon className="size-3.5 text-success" strokeWidth={2.5} />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export { PricingCard, PricingCardFeatures, PricingCardFeature };
