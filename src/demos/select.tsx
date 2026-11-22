import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const defaultCopy = {
  plan: "Plan",
  choosePlan: "Choose a plan",
  plans: "Plans",
  starter: "Starter",
  team: "Team",
  business: "Business",
};

export default function SelectDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Select>
      <SelectTrigger className="w-56" aria-label={copy.plan}>
        <SelectValue placeholder={copy.choosePlan} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{copy.plans}</SelectLabel>
          <SelectItem value="starter">{copy.starter}</SelectItem>
          <SelectItem value="team">{copy.team}</SelectItem>
          <SelectItem value="business">{copy.business}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
