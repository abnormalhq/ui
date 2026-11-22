import { useTranslations } from "next-intl";
import { Banner, BannerDot, BannerText } from "@/components/ui/banner";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusLabel } from "@/components/ui/status-label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UptimeBar } from "@/components/ui/uptime-bar";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

export function DataPreview() {
  const t = useTranslations("Previews");
  return (
    <Workspace>
      <WorkspaceNavigation className="md:w-32">
        <div className="flex items-center gap-2 font-semibold">
          <BrandMark className="size-6" /> Doppel
        </div>
        <p className="rounded-control bg-highlight px-2 py-1.5 font-medium text-highlight-foreground">
          {t("profiles")}
        </p>
        <p className="mt-auto text-xs text-muted-foreground">{t("sampleWorkspace")}</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="compact" className="gap-4">
        <header>
          <h3 className="font-heading text-2xl font-semibold">{t("browserProfiles")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("browserDescription")}</p>
        </header>
        <Table variant="plain" aria-label={t("browserProfilesLabel")}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("profile")}</TableHead>
              <TableHead>{t("state")}</TableHead>
              <TableHead>{t("group")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{t("research")}</TableCell>
              <TableCell>
                <StatusLabel tone="success" variant="dot">
                  {t("running")}
                </StatusLabel>
              </TableCell>
              <TableCell>{t("work")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">{t("reading")}</TableCell>
              <TableCell>
                <StatusLabel tone="pending" variant="dot">
                  {t("starting")}
                </StatusLabel>
              </TableCell>
              <TableCell>{t("personal")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">{t("archive")}</TableCell>
              <TableCell>
                <StatusLabel tone="muted" variant="dot">
                  {t("stopped")}
                </StatusLabel>
              </TableCell>
              <TableCell>{t("work")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </WorkspacePane>
    </Workspace>
  );
}

/** A status page needs no workspace shell, table client code or decorative brand yellow. */
export function StatusPreview() {
  const t = useTranslations("Previews");
  return (
    <div className="grid gap-5 rounded-panel border border-border p-4 md:p-6">
      <header className="flex items-center gap-2">
        <BrandMark className="size-6" />
        <h3 className="font-heading text-xl font-semibold">{t("serviceStatus")}</h3>
      </header>
      <Banner variant="panel" tone="success">
        <BannerText>
          <BannerDot />
          {t("allOperational")}
        </BannerText>
      </Banner>
      <div className="divide-y divide-border">
        {(["mail", "doppel", "website"] as const).map((service) => (
          <div key={service} className="grid gap-2 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{t("services." + service)}</span>
              <StatusLabel variant="dot" tone="success">
                {t("operational")}
              </StatusLabel>
            </div>
            <UptimeBar
              label={t("serviceUptime", { service: t("services." + service) })}
              buckets={Array.from({ length: 30 }, (_, day) => ({
                status: "up",
                title: t("exampleDay", { day: day + 1 }),
              }))}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t("illustrativeHistory")}</p>
    </div>
  );
}
