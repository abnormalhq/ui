import { Marker } from "@/components/ui/marker";

export const defaultCopy = {
  mailboxIs: "Your mailbox is",
  live: "live",
  activeMailboxes: "mailboxes left to activate",
  openInInkShell: "open in the ink shell",
};

export default function MarkerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <span className="font-heading text-[3.25rem] leading-none font-light tracking-[-0.04em]">
        <Marker>01</Marker>
      </span>
      <p className="font-heading text-3xl font-semibold tracking-heading">
        {copy.mailboxIs} <Marker>{copy.live}</Marker>
      </p>
      <p className="text-muted-foreground">
        <Marker className="font-semibold text-foreground">3</Marker> {copy.activeMailboxes}
      </p>
      <p className="ink rounded-control px-3 py-2">
        <Marker className="font-semibold">2</Marker> {copy.openInInkShell}
      </p>
    </div>
  );
}
