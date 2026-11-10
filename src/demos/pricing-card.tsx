import { Button } from "@/components/ui/button";
import { PricingCard, PricingCardFeature, PricingCardFeatures } from "@/components/ui/pricing-card";

export default function PricingCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <PricingCard
        name="Starter"
        description="For one person and one domain."
        price="$4"
        period="per mailbox / month"
        action={<Button variant="outline">Choose Starter</Button>}
      >
        <PricingCardFeatures>
          <PricingCardFeature>10 GB per mailbox</PricingCardFeature>
          <PricingCardFeature>One custom domain</PricingCardFeature>
        </PricingCardFeatures>
      </PricingCard>
      <PricingCard
        featured
        badge="Most popular"
        name="Team"
        description="For a company that shares its mail."
        price="$9"
        period="per mailbox / month"
        action={<Button>Choose Team</Button>}
      >
        <PricingCardFeatures>
          <PricingCardFeature>50 GB per mailbox</PricingCardFeature>
          <PricingCardFeature>Unlimited domains</PricingCardFeature>
          <PricingCardFeature>Shared mailboxes and aliases</PricingCardFeature>
        </PricingCardFeatures>
      </PricingCard>
    </div>
  );
}
