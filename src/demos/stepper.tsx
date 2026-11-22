import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
} from "@/components/ui/stepper";

const steps = [
  { title: "domain", description: "example.com", status: "complete" },
  { title: "dnsRecords", description: "twoOfFour", status: "current" },
  { title: "mailboxes", description: "inviteTeam", status: "upcoming" },
] as const;

export const defaultCopy = {
  domain: "Domain",
  dnsRecords: "DNS records",
  mailboxes: "Mailboxes",
  exampleDomain: "example.com",
  twoOfFour: "Two of four found",
  inviteTeam: "Invite your team",
  completed: "Completed",
  setUpDomain: "Set up your domain",
};

function Steps({ orientation, copy }: { orientation: "horizontal" | "vertical"; copy: typeof defaultCopy }) {
  return (
    <Stepper orientation={orientation} aria-label={copy.setUpDomain}>
      {steps.map(({ title, description, status }, index) => (
        <StepperItem key={title} status={status} statusLabel={status === "complete" ? copy.completed : undefined}>
          <StepperIndicator>{index + 1}</StepperIndicator>
          <StepperContent>
            <StepperTitle>{copy[title]}</StepperTitle>
            <StepperDescription>
              {description === "example.com" ? copy.exampleDomain : copy[description]}
            </StepperDescription>
          </StepperContent>
        </StepperItem>
      ))}
    </Stepper>
  );
}

export default function StepperDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-xl gap-10">
      <Steps orientation="horizontal" copy={copy} />
      <Steps orientation="vertical" copy={copy} />
    </div>
  );
}
