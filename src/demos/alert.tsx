import { CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Maintenance on Sunday</AlertTitle>
        <AlertDescription>Sending pauses for ten minutes at 02:00 UTC.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>Domain verified</AlertTitle>
        <AlertDescription>Mail for this domain is now delivered.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Update the card to keep this subscription.</AlertDescription>
      </Alert>
    </div>
  );
}
