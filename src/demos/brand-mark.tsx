import { BrandArrow, BrandMark, BrandName, ProductMark, type Product } from "@/components/ui/brand-mark";

export const defaultCopy = {
  openWebmail: "Open webmail",
  mail: "Mail",
  console: "Console",
  developers: "Developers",
  status: "Status",
  doppel: "Doppel",
  takeone: "Take One",
};

const PRODUCTS: Product[] = ["mail", "console", "developers", "status", "doppel", "takeone"];

export default function BrandMarkDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-3">
        <BrandMark className="size-10" />
        <BrandName className="text-3xl" />
      </div>
      <ul className="grid grid-cols-3 gap-x-6 gap-y-4 sm:grid-cols-6">
        {PRODUCTS.map((product) => (
          <li key={product} className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <ProductMark product={product} className="size-10" />
            {copy[product]}
          </li>
        ))}
      </ul>
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
