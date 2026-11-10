import { BrandArrow, BrandMark, BrandName } from "@/components/ui/brand-mark";

export default function BrandMarkDemo() {
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
        Open webmail
        <BrandArrow />
      </a>
    </div>
  );
}
