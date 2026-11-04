"use client";

import { MenuIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { BrandMark, BrandName } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TextLink } from "@/components/ui/text-link";
import { SiteNav, type NavGroup } from "@/site/components/site-nav";

const themes = [
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

const subscribe = () => () => {};

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  // The stored choice is unknown in the static HTML, so it stays on System until hydration.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = (hydrated && themes.find(({ value }) => value === theme)) || themes[0]!;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Theme: ${current.label}`}>
          <current.Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={current.value} onValueChange={setTheme}>
          {themes.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
          <ThemePicker />
        </div>
      </div>
    </header>
  );
}
