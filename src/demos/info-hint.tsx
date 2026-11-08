import { InfoHint } from "@/components/ui/info-hint";

export default function InfoHintDemo() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-lg font-semibold">Quota</span>
      <InfoHint label="About quotas">
        Mail counts against the quota of the mailbox it is in, attachments included.
      </InfoHint>
    </div>
  );
}
