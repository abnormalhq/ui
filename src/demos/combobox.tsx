import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const regions = [
  { value: "eu-central", label: "Frankfurt", keywords: ["Germany", "Europe"] },
  { value: "eu-west", label: "Dublin", keywords: ["Ireland", "Europe"] },
  { value: "us-east", label: "Virginia", keywords: ["United States", "America"] },
  { value: "us-west", label: "Oregon", keywords: ["United States", "America"] },
  { value: "ap-southeast", label: "Singapore", keywords: ["Asia"] },
  { value: "ap-northeast", label: "Tokyo", keywords: ["Japan", "Asia"] },
  { value: "sa-east", label: "São Paulo", keywords: ["Brazil", "America"], disabled: true },
];

export default function ComboboxDemo() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="combobox-region">Region</Label>
      <Combobox
        id="combobox-region"
        name="region"
        options={regions}
        defaultValue="eu-central"
        placeholder="Choose a region"
        searchLabel="Search regions"
        searchPlaceholder="City or country"
        emptyMessage="No region matches"
      />
    </div>
  );
}
