import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A strip of clips in playing order, each as wide as it is long: the shots of a video, the takes in a cut, the
 * segments of a recording. The page names the strip with `aria-label` ("Shots"), in its own language, and lays out a
 * ClipTrackRuler, one ClipTrackLane and, after the lane, any ClipTrackPlayhead inside it. The track takes the width it is given and
 * never scrolls on its own; a long programme belongs in the page's own scroll box.
 */
function ClipTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="clip-track"
      className={cn("relative flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * The time marks over the lane. `total` is the length of the whole strip and `ticks` the times to print, in the same
 * unit (seconds, frames), each placed at its share of the width; `format` turns a time into its label ("00:05").
 * The ruler is decoration for sighted readers: each clip states its own length in its accessible name.
 */
function ClipTrackRuler({
  className,
  total,
  ticks,
  format = String,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  total: number;
  ticks: readonly number[];
  format?: (time: number) => string;
}) {
  return (
    <div
      aria-hidden="true"
      data-slot="clip-track-ruler"
      className={cn("relative h-4 font-mono text-2xs text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {ticks.map((tick) => {
        const share = total > 0 ? Math.min(1, Math.max(0, tick / total)) : 0;
        return (
          <span
            key={tick}
            className="absolute top-0 border-l border-border pl-1 leading-4 data-[edge=end]:border-r data-[edge=end]:border-l-0 data-[edge=end]:pr-1 data-[edge=end]:pl-0"
            data-edge={share >= 1 ? "end" : undefined}
            style={share >= 1 ? { right: 0 } : { left: `${share * 100}%` }}
          >
            {format(tick)}
          </span>
        );
      })}
    </div>
  );
}

/**
 * The row of clips: an ordered list, since the order is the cut. Put one ClipTrackItem per clip in it.
 */
function ClipTrackLane({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      role="list"
      data-slot="clip-track-lane"
      className={cn("relative m-0 flex h-14 min-w-0 list-none gap-0.5 p-0", className)}
      {...props}
    />
  );
}

/**
 * One clip's place in the lane. `length` is its length in the ruler's unit: the clips share the lane's width in
 * proportion, and a clip never gets narrower than `minWidth` pixels (default 48), so a one-second clip stays easy to
 * hit beside a minute-long one.
 */
function ClipTrackItem({
  className,
  length,
  minWidth = 48,
  style,
  ...props
}: React.ComponentProps<"li"> & { length: number; minWidth?: number }) {
  return (
    <li
      data-slot="clip-track-item"
      className={cn("flex min-w-0", className)}
      style={{ flex: `${Math.max(0, length)} 1 0px`, minWidth, ...style }}
      {...props}
    />
  );
}

const clipTrackClipVariants = cva(
  [
    "relative flex h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-chip border border-border bg-muted px-2 py-1.5 text-left text-xs text-foreground",
    "transition-colors motion-reduce:transition-none [&:is(a,button)]:cursor-pointer [&:is(a,button)]:hover:bg-accent",
    "focus-visible:-outline-offset-2 data-[selected=true]:border-signal data-[selected=true]:bg-highlight-muted",
  ],
  {
    variants: {
      /** The color of the bar along the clip's foot: its state, in the same tones as a timeline's marks. */
      tone: {
        default: "[--clip-bar:var(--muted-foreground)]",
        pending: "[--clip-bar:var(--badge-ink)]",
        success: "[--clip-bar:var(--success)]",
        destructive: "[--clip-bar:var(--destructive)]",
        current: "[--clip-bar:var(--signal)]",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

/**
 * The clip itself, usually a button (`asChild`) that makes it the current clip. `selected` marks the clip the page
 * shows with the muted highlighter; it is visual only, so the page sets `aria-pressed` or `aria-current` too. `tone`
 * colors the bar along its foot by state, and `progress` (0 to 1) fills that bar for a clip that is still being made;
 * leave it out for a finished clip, whose bar is full. Put the clip's number and name inside, and say its state in
 * words as well: the bar's color is never the only sign.
 */
function ClipTrackClip({
  className,
  asChild = false,
  selected = false,
  tone,
  progress,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof clipTrackClipVariants> & { asChild?: boolean; selected?: boolean; progress?: number }) {
  const Comp = asChild ? Slot.Root : "div";
  const share = progress === undefined ? 1 : Math.min(1, Math.max(0, progress));
  const bar = (
    <span
      aria-hidden="true"
      data-slot="clip-track-bar"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-(--clip-bar) transition-transform motion-reduce:transition-none"
      style={{ transform: `scaleX(${share})` }}
    />
  );
  return (
    <Comp
      data-slot="clip-track-clip"
      data-selected={selected || undefined}
      className={cn(clipTrackClipVariants({ tone }), className)}
      {...props}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      {bar}
    </Comp>
  );
}

/**
 * The line down the ruler and the lane at a time in the programme: `position` in the ruler's unit, out of `total`,
 * placed over the track's full width, so the ruler and the lane must span it too. Decoration,
 * like the ruler; the page says where playback is in words elsewhere (a time code beside the player).
 */
function ClipTrackPlayhead({
  className,
  position,
  total,
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { position: number; total: number }) {
  const share = total > 0 ? Math.min(1, Math.max(0, position / total)) : 0;
  return (
    <span
      aria-hidden="true"
      data-slot="clip-track-playhead"
      className={cn("pointer-events-none absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-signal", className)}
      style={{ left: `${share * 100}%`, ...style }}
      {...props}
    />
  );
}

export {
  ClipTrack,
  ClipTrackRuler,
  ClipTrackLane,
  ClipTrackItem,
  ClipTrackClip,
  ClipTrackPlayhead,
  clipTrackClipVariants,
};
