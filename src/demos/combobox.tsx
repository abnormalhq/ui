import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const regions = [
  { value: "eu-central", labelKey: "frankfurt", keywords: ["Germany", "Europe", "德国", "欧洲"] },
  { value: "eu-west", labelKey: "dublin", keywords: ["Ireland", "Europe", "爱尔兰", "欧洲"] },
  { value: "us-east", labelKey: "virginia", keywords: ["United States", "America", "美国"] },
  { value: "us-west", labelKey: "oregon", keywords: ["United States", "America", "美国"] },
  { value: "ap-southeast", labelKey: "singapore", keywords: ["Asia", "亚洲"] },
  { value: "ap-northeast", labelKey: "tokyo", keywords: ["Japan", "Asia", "日本", "亚洲"] },
  { value: "sa-east", labelKey: "saoPaulo", keywords: ["Brazil", "America", "巴西", "美洲"], disabled: true },
];

type RegionCopyKey = "frankfurt" | "dublin" | "virginia" | "oregon" | "singapore" | "tokyo" | "saoPaulo";

export const defaultCopy = {
  region: "Region",
  chooseRegion: "Choose a region",
  searchRegions: "Search regions",
  cityOrCountry: "City or country",
  noRegionMatches: "No region matches",
  frankfurt: "Frankfurt",
  dublin: "Dublin",
  virginia: "Virginia",
  oregon: "Oregon",
  singapore: "Singapore",
  tokyo: "Tokyo",
  saoPaulo: "São Paulo",
};

export default function ComboboxDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const options = regions.map(({ labelKey, ...region }) => ({ ...region, label: copy[labelKey as RegionCopyKey] }));
  return (
    <div className="grid gap-2">
      <Label htmlFor="combobox-region">{copy.region}</Label>
      <Combobox
        id="combobox-region"
        name="region"
        options={options}
        defaultValue="eu-central"
        placeholder={copy.chooseRegion}
        searchLabel={copy.searchRegions}
        searchPlaceholder={copy.cityOrCountry}
        emptyMessage={copy.noRegionMatches}
      />
    </div>
  );
}
