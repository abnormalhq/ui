import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const defaultCopy = {
  view: "View",
  day: "Day",
  week: "Week",
  month: "Month",
  alignment: "Alignment",
  alignLeft: "Align left",
  alignCenter: "Align center",
  alignRight: "Align right",
};

export default function ToggleGroupDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid justify-items-center gap-4">
      <ToggleGroup type="single" defaultValue="week" variant="outline" aria-label={copy.view}>
        <ToggleGroupItem value="day">{copy.day}</ToggleGroupItem>
        <ToggleGroupItem value="week">{copy.week}</ToggleGroupItem>
        <ToggleGroupItem value="month">{copy.month}</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={["left"]} aria-label={copy.alignment}>
        <ToggleGroupItem value="left" aria-label={copy.alignLeft}>
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label={copy.alignCenter}>
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label={copy.alignRight}>
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
