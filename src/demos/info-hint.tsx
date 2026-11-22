import { InfoHint } from "@/components/ui/info-hint";

export const defaultCopy = {
  quota: "Quota",
  aboutQuotas: "About quotas",
  description: "Mail counts against the quota of the mailbox it is in, attachments included.",
};

export default function InfoHintDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex items-center gap-1">
      <span className="text-lg font-semibold">{copy.quota}</span>
      <InfoHint label={copy.aboutQuotas}>{copy.description}</InfoHint>
    </div>
  );
}
