import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const defaultCopy = {
  storage: "Storage",
  sharedByMailboxes: "Shared by every mailbox.",
  manage: "Manage",
  storageUsage: "12 of 50 GB used",
  upgrade: "Upgrade",
  team: "Team",
  featuredDescription: "The featured variant, for the one that leads.",
  teamLimit: "Up to 25 people",
};

export default function CardDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          {/* The preview sits under an h2, so the titles are h3s. */}
          <CardTitle asChild>
            <h3>{copy.storage}</h3>
          </CardTitle>
          <CardDescription>{copy.sharedByMailboxes}</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              {copy.manage}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>{copy.storageUsage}</CardContent>
        <CardFooter>
          <Button size="sm">{copy.upgrade}</Button>
        </CardFooter>
      </Card>
      <Card variant="featured">
        <CardHeader>
          <CardTitle asChild>
            <h3>{copy.team}</h3>
          </CardTitle>
          <CardDescription>{copy.featuredDescription}</CardDescription>
        </CardHeader>
        <CardContent>{copy.teamLimit}</CardContent>
      </Card>
    </div>
  );
}
