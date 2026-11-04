"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      {/* Uncontrolled and named: the form submits digest=on while it is on, and Reset puts it back on. */}
      <form className="flex items-center gap-3">
        <Switch id="switch-digest" name="digest" defaultChecked />
        <Label htmlFor="switch-digest">Weekly digest</Label>
        <Button type="reset" variant="outline" size="sm">
          Reset
        </Button>
      </form>
      {/* Disabled, so the form leaves it out and the label after it dims. */}
      <div className="flex items-center gap-3">
        <Switch id="switch-sms" name="sms" disabled />
        <Label htmlFor="switch-sms">Text messages</Label>
      </div>
    </div>
  );
}
