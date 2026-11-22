import { Progress } from "@/components/ui/progress";

export const defaultCopy = {
  storage: "Storage",
  twelveOfFifty: "12 of 50 GB",
  eightOfTen: "8.6 of 10 GB",
  nineOfTen: "9.9 of 10 GB",
  importing: "Importing…",
};

export default function ProgressDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="progress-storage">{copy.storage}</span>
          <span className="text-muted-foreground">{copy.twelveOfFifty}</span>
        </div>
        <Progress value={24} aria-labelledby="progress-storage" />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="progress-support">support@example.com</span>
          <span className="text-muted-foreground">{copy.eightOfTen}</span>
        </div>
        <Progress value={86} tone="warning" aria-labelledby="progress-support" />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="progress-sales">sales@example.com</span>
          <span className="text-muted-foreground">{copy.nineOfTen}</span>
        </div>
        <Progress value={99} tone="destructive" aria-labelledby="progress-sales" />
      </div>
      <div className="grid gap-2">
        <span id="progress-import" className="text-sm">
          {copy.importing}
        </span>
        <Progress aria-labelledby="progress-import" />
      </div>
    </div>
  );
}
