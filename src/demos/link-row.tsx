import { LinkRow } from "@/components/ui/link-row";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const items = [
  { name: "Button", href: "/components/button", group: "Controls" },
  { name: "Table", href: "/components/table", group: "Display" },
];

export default function LinkRowDemo() {
  return (
    <Table variant="plain">
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Group</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(({ name, href, group }) => (
          <LinkRow key={href} href={href}>
            <TableCell className="font-medium">
              {/* The real link: keyboard, screen readers and a middle click use it. */}
              <a href={href}>{name}</a>
            </TableCell>
            <TableCell className="text-muted-foreground">{group}</TableCell>
          </LinkRow>
        ))}
      </TableBody>
    </Table>
  );
}
