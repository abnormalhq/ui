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

export default function CommandDemo() {
  return (
    <Command className="max-w-md rounded-panel border border-border">
      <CommandInput label="Search commands" placeholder="Type a command" />
      <CommandList>
        <CommandGroup heading="Mail">
          <CommandItem value="Compose" keywords={["new", "write"]}>
            <MailPlusIcon aria-hidden="true" />
            Compose
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem value="Archive conversation">
            <ArchiveIcon aria-hidden="true" />
            Archive conversation
            <CommandShortcut>E</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspace">
          <CommandItem value="Invite a member" keywords={["add", "user"]}>
            <UserPlusIcon aria-hidden="true" />
            Invite a member
          </CommandItem>
          <CommandItem value="Settings" keywords={["preferences"]}>
            <SettingsIcon aria-hidden="true" />
            Settings
          </CommandItem>
          <CommandItem value="Dark theme" disabled>
            <MoonIcon aria-hidden="true" />
            Dark theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandEmpty>No command matches</CommandEmpty>
    </Command>
  );
}
