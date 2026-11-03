import { StatusLabel } from "@/components/ui/status-label";

const tones = [
  { tone: "success", label: "Enabled" },
  { tone: "pending", label: "Pending" },
  { tone: "muted", label: "Disabled" },
  { tone: "destructive", label: "Failed" },
] as const;

export default function StatusLabelDemo() {
  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {tones.map(({ tone, label }) => (
          <StatusLabel key={tone} tone={tone}>
            {label}
          </StatusLabel>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {tones.map(({ tone, label }) => (
          <StatusLabel key={tone} tone={tone} variant="dot">
            {label}
          </StatusLabel>
        ))}
      </div>
    </div>
  );
}
