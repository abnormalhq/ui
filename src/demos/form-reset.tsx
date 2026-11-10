"use client";

import { useRef, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFormReset } from "@/components/ui/use-form-reset";

/* A field of the page's own: the number lives in state and submits through a hidden input, which a reset never touches. */
function Seats({ name, defaultValue }: { name: string; defaultValue: number }) {
  const [seats, setSeats] = useState(defaultValue);
  const field = useRef<HTMLInputElement>(null);
  // Runs once the reset has gone through, and not at all when the form's onReset cancelled it.
  useFormReset(field, () => setSeats(defaultValue));

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Remove a seat"
        disabled={seats <= 1}
        onClick={() => setSeats(seats - 1)}
      >
        <MinusIcon />
      </Button>
      <output className="w-8 text-center tabular-nums">{seats}</output>
      <Button type="button" variant="outline" size="icon" aria-label="Add a seat" onClick={() => setSeats(seats + 1)}>
        <PlusIcon />
      </Button>
      <input ref={field} type="hidden" name={name} value={seats} />
    </div>
  );
}

export default function FormResetDemo() {
  const [locked, setLocked] = useState(false);

  return (
    <div className="grid gap-5">
      {/* While the plan is locked the page cancels the reset, and every field keeps its value: Switch, Combobox,
          DatePicker and DateRangePicker use the same hook. */}
      <form
        className="grid gap-4"
        onReset={(event) => {
          if (locked) event.preventDefault();
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm">Seats</span>
          <Seats name="seats" defaultValue={5} />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="form-reset-digest" name="digest" defaultChecked />
          <Label htmlFor="form-reset-digest">Weekly digest</Label>
        </div>
        <Button type="reset" variant="outline" size="sm" className="justify-self-start">
          Reset
        </Button>
      </form>
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Switch id="form-reset-locked" checked={locked} onCheckedChange={setLocked} />
        <Label htmlFor="form-reset-locked">Lock the plan: cancel the reset</Label>
      </div>
    </div>
  );
}
