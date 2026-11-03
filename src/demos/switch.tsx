"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SwitchDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex items-center gap-3">
      <Switch id="switch-notify" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="switch-notify">Email notifications</Label>
    </div>
  );
}
