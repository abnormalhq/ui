"use client";

import { useState } from "react";
import { CloudOffIcon, PlaneIcon, WrenchIcon } from "lucide-react";
import { Banner, BannerAction, BannerClose, BannerDot, BannerMeta, BannerText } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export const defaultCopy = {
  operational: "All systems operational",
  checkedAgo: "Checked 2 minutes ago",
  autoReply: "The auto-reply is on until 20 November.",
  manage: "Manage",
  maintenance: "Maintenance",
  databaseUpgrade: "Database upgrade",
  maintenanceWindow: "Sunday 03:00 – 05:00 UTC",
  offline: "You are offline. Mail you send waits until you are back.",
  dismiss: "Dismiss",
};

export default function BannerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [offline, setOffline] = useState(true);
  return (
    <div className="grid w-full gap-6">
      <Banner variant="panel" tone="success">
        <BannerText>
          <BannerDot />
          {copy.operational}
        </BannerText>
        <BannerMeta>{copy.checkedAgo}</BannerMeta>
      </Banner>
      <div className="grid overflow-hidden rounded-panel border border-border">
        <Banner tone="highlight">
          <PlaneIcon />
          <BannerText>{copy.autoReply}</BannerText>
          <BannerAction>
            <Button size="sm" variant="ghost">
              {copy.manage}
            </Button>
          </BannerAction>
        </Banner>
        <Banner tone="warning">
          <WrenchIcon />
          <BannerText>
            <span className="font-medium text-badge-ink">{copy.maintenance}</span> {copy.databaseUpgrade}
          </BannerText>
          <BannerMeta>{copy.maintenanceWindow}</BannerMeta>
        </Banner>
        {offline && (
          <Banner>
            <CloudOffIcon />
            <BannerText>{copy.offline}</BannerText>
            <BannerClose label={copy.dismiss} onClick={() => setOffline(false)} />
          </Banner>
        )}
        <div className="h-24 bg-background" />
      </div>
    </div>
  );
}
