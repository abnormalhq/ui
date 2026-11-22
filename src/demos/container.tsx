import { Container } from "@/components/ui/container";

export const defaultCopy = { description: "At most 1184px, with gutters that tighten on narrow screens" };

export default function ContainerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="w-full bg-surface py-6">
      <Container className="rounded-control border border-dashed border-input bg-background py-6 text-center text-muted-foreground">
        {copy.description}
      </Container>
    </div>
  );
}
