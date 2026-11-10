import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
} from "@/components/ui/stepper";

const steps = [
  { title: "Domain", description: "example.com", status: "complete" },
  { title: "DNS records", description: "Two of four found", status: "current" },
  { title: "Mailboxes", description: "Invite your team", status: "upcoming" },
] as const;

function Steps({ orientation }: { orientation: "horizontal" | "vertical" }) {
  return (
    <Stepper orientation={orientation} aria-label="Set up your domain">
      {steps.map(({ title, description, status }, index) => (
        <StepperItem key={title} status={status} statusLabel={status === "complete" ? "Completed" : undefined}>
          <StepperIndicator>{index + 1}</StepperIndicator>
          <StepperContent>
            <StepperTitle>{title}</StepperTitle>
            <StepperDescription>{description}</StepperDescription>
          </StepperContent>
        </StepperItem>
      ))}
    </Stepper>
  );
}

export default function StepperDemo() {
  return (
    <div className="grid w-full max-w-xl gap-10">
      <Steps orientation="horizontal" />
      <Steps orientation="vertical" />
    </div>
  );
}
