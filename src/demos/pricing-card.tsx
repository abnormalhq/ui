import { Button } from "@/components/ui/button";
import { PricingCard, PricingCardFeature, PricingCardFeatures } from "@/components/ui/pricing-card";

export const defaultCopy = {
  starter: "Starter",
  starterDescription: "For one person and one domain.",
  period: "per mailbox / month",
  chooseStarter: "Choose Starter",
  tenGb: "10 GB per mailbox",
  oneDomain: "One custom domain",
  mostPopular: "Most popular",
  team: "Team",
  teamDescription: "For a company that shares its mail.",
  discount: "25% off",
  originalPrice: "Original price",
  chooseTeam: "Choose Team",
  fiftyGb: "50 GB per mailbox",
  unlimitedDomains: "Unlimited domains",
  sharedMailboxes: "Shared mailboxes and aliases",
};

export default function PricingCardDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <PricingCard
        name={copy.starter}
        description={copy.starterDescription}
        price="$4"
        period={copy.period}
        action={<Button variant="outline">{copy.chooseStarter}</Button>}
      >
        <PricingCardFeatures>
          <PricingCardFeature>{copy.tenGb}</PricingCardFeature>
          <PricingCardFeature>{copy.oneDomain}</PricingCardFeature>
        </PricingCardFeatures>
      </PricingCard>
      <PricingCard
        featured
        badge={copy.mostPopular}
        name={copy.team}
        description={copy.teamDescription}
        price="$9"
        period={copy.period}
        discount={copy.discount}
        originalPrice="$12"
        originalPriceLabel={copy.originalPrice}
        action={<Button>{copy.chooseTeam}</Button>}
      >
        <PricingCardFeatures>
          <PricingCardFeature>{copy.fiftyGb}</PricingCardFeature>
          <PricingCardFeature>{copy.unlimitedDomains}</PricingCardFeature>
          <PricingCardFeature>{copy.sharedMailboxes}</PricingCardFeature>
        </PricingCardFeatures>
      </PricingCard>
    </div>
  );
}
