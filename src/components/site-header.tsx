"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandMark, BrandName } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TextLink } from "@/components/ui/text-link";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";
import { useThemePreference } from "@/components/ui/use-theme-preference";
import { SiteNav, type NavGroup } from "@/site/components/site-nav";

const labels: Record<ThemePreference, string> = { system: "System", light: "Light", dark: "Dark" };
/** The registry's ThemePicker over the preference the registry's ThemeScript keeps. */
function SiteThemePicker() {
  const [value, setValue] = useThemePreference();
  return (
    <ThemePicker value={value} onValueChange={setValue} labels={labels} label={`Theme: ${labels[value ?? "system"]}`} />
  );
}

function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" closeLabel="Close navigation" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Abnormal UI</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <SiteNav groups={groups} onNavigate={() => setOpen(false)} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader({ groups }: { groups: NavGroup[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <MobileNav groups={groups} />
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="size-6" />
          <BrandName className="text-lg" />
          <span className="sr-only">UI overview</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <TextLink href="/r/registry.json" className="text-sm max-[37.4375rem]:hidden">
            registry.json
          </TextLink>
          <SiteThemePicker />
        </div>
      </div>
    </header>
  );
}
