import { CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const defaultCopy = {
  maintenanceTitle: "Maintenance on Sunday",
  maintenanceDescription: "Sending pauses for ten minutes at 02:00 UTC.",
  verifiedTitle: "Domain verified",
  verifiedDescription: "Mail for this domain is now delivered.",
  paymentFailedTitle: "Payment failed",
  paymentFailedDescription: "Update the card to keep this subscription.",
};

export default function AlertDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>{copy.maintenanceTitle}</AlertTitle>
        <AlertDescription>{copy.maintenanceDescription}</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>{copy.verifiedTitle}</AlertTitle>
        <AlertDescription>{copy.verifiedDescription}</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>{copy.paymentFailedTitle}</AlertTitle>
        <AlertDescription>{copy.paymentFailedDescription}</AlertDescription>
      </Alert>
    </div>
  );
}
