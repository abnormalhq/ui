import { BrandMark, BrandName } from "@/components/ui/brand-mark";

export default function BrandMarkDemo() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="size-10" />
      <BrandName className="text-3xl" />
    </div>
  );
}
