import { Eyebrow, HeadingMark, SectionTitle } from "@/components/ui/section-heading";

export const defaultCopy = {
  pricing: "Pricing",
  title: "Pay for what you send",
};

export default function SectionHeadingDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="w-full">
      <Eyebrow>{copy.pricing}</Eyebrow>
      <SectionTitle>
        {copy.title}
        <HeadingMark>.</HeadingMark>
      </SectionTitle>
    </div>
  );
}
