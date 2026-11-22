import { StatusLabel } from "@/components/ui/status-label";

export const defaultCopy = { enabled: "Enabled", pending: "Pending", disabled: "Disabled", failed: "Failed" };

const tones = [
  { tone: "success", label: "enabled" },
  { tone: "pending", label: "pending" },
  { tone: "muted", label: "disabled" },
  { tone: "destructive", label: "failed" },
] as const;

export default function StatusLabelDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {tones.map(({ tone, label }) => (
          <StatusLabel key={tone} tone={tone}>
            {copy[label]}
          </StatusLabel>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {tones.map(({ tone, label }) => (
          <StatusLabel key={tone} tone={tone} variant="dot">
            {copy[label]}
          </StatusLabel>
        ))}
      </div>
    </div>
  );
}
