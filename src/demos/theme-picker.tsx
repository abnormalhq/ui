"use client";

import { useState } from "react";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";

const labels = { system: "System", light: "Light", dark: "Dark" };

/* The page holds the preference (here in state; a project keeps it with next-themes, a cookie or its own script). */
export default function ThemePickerDemo() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  return (
    <div className="flex items-center gap-3">
      <ThemePicker
        value={preference}
        onValueChange={setPreference}
        labels={labels}
        label={`Theme: ${labels[preference]}`}
      />
      <span className="text-sm text-muted-foreground">{labels[preference]}</span>
    </div>
  );
}
