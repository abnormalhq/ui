"use client";

import { useState } from "react";
import {
  ClipTrack,
  ClipTrackClip,
  ClipTrackItem,
  ClipTrackLane,
  ClipTrackPlayhead,
  ClipTrackRuler,
  clipTrackMinWidth,
} from "@/components/ui/clip-track";

export const defaultCopy = {
  shots: "Shots",
  window: "Push in to the window",
  glass: "Glass close-up",
  hand: "A hand comes in",
  empty: "Empty table",
  done: "Done",
  making: "Generating",
  draft: "Draft",
  failed: "Failed",
  seconds: "s",
};

const clips = [
  { title: "window", length: 5, state: "done" },
  { title: "glass", length: 3, state: "done" },
  { title: "hand", length: 5, state: "making", progress: 0.4 },
  { title: "empty", length: 2, state: "failed" },
  { title: "empty", length: 5, state: "draft" },
] as const;

const tones = { done: "success", making: "current", draft: "default", failed: "destructive" } as const;

function timecode(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

/*
 * The page keeps the current clip in its own state; the playhead sits a second into it. The track scrolls sideways once
 * the two-second clip would get narrower than 48px, and the line under it says the current clip and time in words.
 */
export default function ClipTrackDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [current, setCurrent] = useState(0);
  const total = clips.reduce((sum, clip) => sum + clip.length, 0);
  const start = clips.slice(0, current).reduce((sum, clip) => sum + clip.length, 0);
  const selected = clips[current]!;
  return (
    <div className="w-full max-w-2xl">
      <div className="overflow-x-auto pb-1">
        <ClipTrack aria-label={copy.shots} style={{ minWidth: clipTrackMinWidth(clips.map((clip) => clip.length)) }}>
          <ClipTrackRuler total={total} ticks={[0, 5, 10, 15, total]} format={timecode} />
          <ClipTrackLane>
            {clips.map((clip, index) => (
              <ClipTrackItem key={index} length={clip.length}>
                <ClipTrackClip
                  asChild
                  selected={index === current}
                  tone={tones[clip.state]}
                  progress={"progress" in clip ? clip.progress : undefined}
                >
                  <button type="button" aria-pressed={index === current} onClick={() => setCurrent(index)}>
                    <span className="truncate font-medium">
                      {String(index + 1).padStart(2, "0")} {copy[clip.title]}
                    </span>
                    <span className="truncate text-2xs text-muted-foreground">
                      {clip.length}
                      {copy.seconds} · {copy[clip.state]}
                    </span>
                  </button>
                </ClipTrackClip>
              </ClipTrackItem>
            ))}
          </ClipTrackLane>
          <ClipTrackPlayhead position={start + 1} total={total} />
        </ClipTrack>
      </div>
      <p aria-live="polite" className="mt-2 font-mono text-2xs text-muted-foreground tabular-nums">
        {String(current + 1).padStart(2, "0")} {copy[selected.title]} · {selected.length}
        {copy.seconds} · {copy[selected.state]} · {timecode(start + 1)} / {timecode(total)}
      </p>
    </div>
  );
}
