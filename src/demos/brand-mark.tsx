import { BrandArrow, BrandMark, BrandName } from "@/components/ui/brand-mark";

export const defaultCopy = { openWebmail: "Open webmail" };

export default function BrandMarkDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <BrandMark className="size-10" />
        <BrandName className="text-3xl" />
      </div>
      <a
        href="#"
        className="inline-flex items-center gap-1.5 font-medium underline decoration-border underline-offset-4"
      >
        {copy.openWebmail}
        <BrandArrow />
      </a>
    </div>
  );
}
