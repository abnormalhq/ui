import { NativeSelect } from "@/components/ui/native-select";

export const defaultCopy = {
  plan: "Plan",
  planSmall: "Plan, small",
  planLarge: "Plan, large",
  starter: "Starter",
  team: "Team",
  business: "Business",
};

export default function NativeSelectDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const plans = (
    <>
      <option value="starter">{copy.starter}</option>
      <option value="team">{copy.team}</option>
      <option value="business">{copy.business}</option>
    </>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NativeSelect size="sm" aria-label={copy.planSmall} defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
      <NativeSelect aria-label={copy.plan} defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
      <NativeSelect size="lg" aria-label={copy.planLarge} defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
    </div>
  );
}
