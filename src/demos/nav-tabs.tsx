import { NavTab, NavTabs } from "@/components/ui/nav-tabs";

/* Each tab is a link to its own address; a project passes its router's Link with asChild. */
export default function NavTabsDemo() {
  return (
    <div className="grid w-full max-w-lg gap-6">
      <NavTabs label="Settings sections">
        <NavTab href="#general" current>
          General
        </NavTab>
        <NavTab href="#domains">Domains</NavTab>
        <NavTab href="#members">Members</NavTab>
        <NavTab href="#billing">Billing</NavTab>
      </NavTabs>
      <NavTabs label="Settings sections" variant="pill">
        <NavTab href="#domains" current>
          Domains
        </NavTab>
        <NavTab href="#members">Members</NavTab>
        <NavTab href="#ai">AI features</NavTab>
        <NavTab href="#security">Security</NavTab>
        <NavTab href="#audit">Audit log</NavTab>
      </NavTabs>
      <NavTabs label="Period" variant="segmented">
        <NavTab href="?range=7d">7 days</NavTab>
        <NavTab href="?range=30d" current>
          30 days
        </NavTab>
        <NavTab href="?range=90d">90 days</NavTab>
      </NavTabs>
    </div>
  );
}
