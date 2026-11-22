"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

export const defaultCopy = {
  mailboxQuota: "Mailbox quota",
  attachmentSize: "Attachment size",
  to: "to",
  smallestAttachment: "Smallest attachment",
  largestAttachment: "Largest attachment",
};

export default function SliderDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [quota, setQuota] = useState([20]);
  const [range, setRange] = useState([10, 40]);
  return (
    <div className="grid w-full max-w-sm gap-8">
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="slider-quota">{copy.mailboxQuota}</span>
          <span className="text-muted-foreground">{quota[0]} GB</span>
        </div>
        <Slider
          value={quota}
          onValueChange={setQuota}
          min={5}
          max={50}
          step={5}
          aria-labelledby="slider-quota"
          getValueText={(value) => `${value} GB`}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span>{copy.attachmentSize}</span>
          <span className="text-muted-foreground">
            {range[0]} {copy.to} {range[1]} MB
          </span>
        </div>
        <Slider
          value={range}
          onValueChange={setRange}
          max={50}
          minStepsBetweenThumbs={1}
          thumbLabels={[copy.smallestAttachment, copy.largestAttachment]}
          getValueText={(value) => `${value} MB`}
        />
      </div>
    </div>
  );
}
