"use client";

import { useState } from "react";
import { CloudOffIcon, PlaneIcon, WrenchIcon } from "lucide-react";
import { Banner, BannerAction, BannerClose, BannerDot, BannerMeta, BannerText } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export default function BannerDemo() {
  const [offline, setOffline] = useState(true);
  return (
    <div className="grid w-full gap-6">
      <Banner variant="panel" tone="success">
        <BannerText>
          <BannerDot />
          All systems operational
        </BannerText>
        <BannerMeta>Checked 2 minutes ago</BannerMeta>
      </Banner>
      <div className="grid overflow-hidden rounded-panel border border-border">
        <Banner tone="highlight">
          <PlaneIcon />
          <BannerText>The auto-reply is on until 20 November.</BannerText>
          <BannerAction>
            <Button size="sm" variant="ghost">
              Manage
            </Button>
          </BannerAction>
        </Banner>
        <Banner tone="warning">
          <WrenchIcon />
          <BannerText>
            <span className="font-medium text-badge-ink">Maintenance</span> Database upgrade
          </BannerText>
          <BannerMeta>Sunday 03:00 – 05:00 UTC</BannerMeta>
        </Banner>
        {offline && (
          <Banner>
            <CloudOffIcon />
            <BannerText>You are offline. Mail you send waits until you are back.</BannerText>
            <BannerClose label="Dismiss" onClick={() => setOffline(false)} />
          </Banner>
        )}
        <div className="h-24 bg-background" />
      </div>
    </div>
  );
}
