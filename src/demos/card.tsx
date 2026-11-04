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

export default function CardDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          {/* The preview sits under an h2, so the titles are h3s. */}
          <CardTitle asChild>
            <h3>Storage</h3>
          </CardTitle>
          <CardDescription>Shared by every mailbox.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>12 of 50 GB used</CardContent>
        <CardFooter>
          <Button size="sm">Upgrade</Button>
        </CardFooter>
      </Card>
      <Card variant="featured">
        <CardHeader>
          <CardTitle asChild>
            <h3>Team</h3>
          </CardTitle>
          <CardDescription>The featured variant, for the one that leads.</CardDescription>
        </CardHeader>
        <CardContent>Up to 25 people</CardContent>
      </Card>
    </div>
  );
}
