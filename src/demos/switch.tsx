"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SwitchDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Switch id="switch-notify" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="switch-notify">Email notifications</Label>
      </div>
      {/* Uncontrolled and named, so a form would submit digest=on; disabled, so the label after it dims. */}
      <div className="flex items-center gap-3">
        <Switch id="switch-digest" name="digest" defaultChecked disabled />
        <Label htmlFor="switch-digest">Weekly digest</Label>
      </div>
    </div>
  );
}
