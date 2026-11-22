import { ArchiveIcon, MailPlusIcon, MoonIcon, SettingsIcon, UserPlusIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export const defaultCopy = {
  searchLabel: "Search commands",
  searchPlaceholder: "Type a command",
  mail: "Mail",
  compose: "Compose",
  archiveConversation: "Archive conversation",
  workspace: "Workspace",
  inviteMember: "Invite a member",
  settings: "Settings",
  darkTheme: "Dark theme",
  noCommandMatches: "No command matches",
};

export default function CommandDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Command className="max-w-md rounded-panel border border-border">
      <CommandInput label={copy.searchLabel} placeholder={copy.searchPlaceholder} />
      <CommandList>
        <CommandGroup heading={copy.mail}>
          <CommandItem value="Compose" keywords={["new", "write", copy.compose]}>
            <MailPlusIcon aria-hidden="true" />
            {copy.compose}
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem value="Archive conversation" keywords={[copy.archiveConversation]}>
            <ArchiveIcon aria-hidden="true" />
            {copy.archiveConversation}
            <CommandShortcut>E</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={copy.workspace}>
          <CommandItem value="Invite a member" keywords={["add", "user", copy.inviteMember]}>
            <UserPlusIcon aria-hidden="true" />
            {copy.inviteMember}
          </CommandItem>
          <CommandItem value="Settings" keywords={["preferences", copy.settings]}>
            <SettingsIcon aria-hidden="true" />
            {copy.settings}
          </CommandItem>
          <CommandItem value="Dark theme" keywords={[copy.darkTheme]} disabled>
            <MoonIcon aria-hidden="true" />
            {copy.darkTheme}
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandEmpty>{copy.noCommandMatches}</CommandEmpty>
    </Command>
  );
}
