"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavGroup = { title: string; items: { name: string; title: string }[] };

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const current = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "block rounded-chip px-2 py-1 text-base transition-colors duration-150",
        current
          ? "bg-highlight font-medium text-highlight-foreground"
          : "text-muted-foreground hover:bg-control hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Components" className="grid gap-6">
      <NavLink href="/" label="Overview" onNavigate={onNavigate} />
      {groups.map((group) => (
        <div key={group.title} className="grid gap-1">
          <h2 className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</h2>
          {group.items.map((item) => (
            <NavLink
              key={item.name}
              href={`/components/${item.name}`}
              label={item.title.replace(/^Abnormal /, "")}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
