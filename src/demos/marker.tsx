import { Marker } from "@/components/ui/marker";

export default function MarkerDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <span className="font-heading text-[3.25rem] leading-none font-light tracking-[-0.04em]">
        <Marker>01</Marker>
      </span>
      <p className="font-heading text-3xl font-semibold tracking-[-0.02em]">
        Your mailbox is <Marker>live</Marker>
      </p>
      <p className="text-muted-foreground">
        <Marker className="font-semibold text-foreground">3</Marker> mailboxes left to activate
      </p>
      <p className="ink rounded-control px-3 py-2">
        <Marker className="font-semibold">2</Marker> open in the ink shell
      </p>
    </div>
  );
}
