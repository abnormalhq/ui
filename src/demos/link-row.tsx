import { LinkRow } from "@/components/ui/link-row";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const items = [
  { name: "Button", href: "/components/button", group: "controls" },
  { name: "Table", href: "/components/table", group: "display" },
] as const;

export const defaultCopy = { item: "Item", group: "Group", controls: "Controls", display: "Display" };

export default function LinkRowDemo({
  copy: overrides = {},
  hrefPrefix = "",
}: {
  copy?: Partial<typeof defaultCopy>;
  hrefPrefix?: string;
} = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Table variant="plain">
      <TableHeader>
        <TableRow>
          <TableHead>{copy.item}</TableHead>
          <TableHead>{copy.group}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(({ name, href, group }) => {
          const destination = hrefPrefix + href;
          return (
            <LinkRow key={href} href={destination}>
              <TableCell className="font-medium">
                {/* The real link: keyboard, screen readers and a middle click use it. */}
                <a href={destination}>{name}</a>
              </TableCell>
              <TableCell className="text-muted-foreground">{copy[group]}</TableCell>
            </LinkRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
