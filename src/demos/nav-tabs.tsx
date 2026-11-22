import { NavTab, NavTabs } from "@/components/ui/nav-tabs";

export const defaultCopy = {
  settingsSections: "Settings sections",
  general: "General",
  domains: "Domains",
  members: "Members",
  billing: "Billing",
  aiFeatures: "AI features",
  security: "Security",
  auditLog: "Audit log",
  period: "Period",
  sevenDays: "7 days",
  thirtyDays: "30 days",
  ninetyDays: "90 days",
};

/* Each tab is a link to its own address; a project passes its router's Link with asChild. */
export default function NavTabsDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-lg gap-6">
      <NavTabs label={copy.settingsSections}>
        <NavTab href="#general" current>
          {copy.general}
        </NavTab>
        <NavTab href="#domains">{copy.domains}</NavTab>
        <NavTab href="#members">{copy.members}</NavTab>
        <NavTab href="#billing">{copy.billing}</NavTab>
      </NavTabs>
      <NavTabs label={copy.settingsSections} variant="pill">
        <NavTab href="#domains" current>
          {copy.domains}
        </NavTab>
        <NavTab href="#members">{copy.members}</NavTab>
        <NavTab href="#ai">{copy.aiFeatures}</NavTab>
        <NavTab href="#security">{copy.security}</NavTab>
        <NavTab href="#audit">{copy.auditLog}</NavTab>
      </NavTabs>
      <NavTabs label={copy.period} variant="segmented">
        <NavTab href="?range=7d">{copy.sevenDays}</NavTab>
        <NavTab href="?range=30d" current>
          {copy.thirtyDays}
        </NavTab>
        <NavTab href="?range=90d">{copy.ninetyDays}</NavTab>
      </NavTabs>
    </div>
  );
}
