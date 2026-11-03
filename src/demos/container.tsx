import { Container } from "@/components/ui/container";

export default function ContainerDemo() {
  return (
    <div className="w-full bg-surface py-6">
      <Container className="rounded-control border border-dashed border-input bg-background py-6 text-center text-muted-foreground">
        At most 1184px, with gutters that tighten on narrow screens
      </Container>
    </div>
  );
}
