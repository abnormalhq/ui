import { Eyebrow, HeadingMark, SectionTitle } from "@/components/ui/section-heading";

export default function SectionHeadingDemo() {
  return (
    <div className="w-full">
      <Eyebrow>Pricing</Eyebrow>
      <SectionTitle>
        Pay for what you send<HeadingMark>.</HeadingMark>
      </SectionTitle>
    </div>
  );
}
