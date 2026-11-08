import { Progress } from "@/components/ui/progress";

export default function ProgressDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="progress-storage">Storage</span>
          <span className="text-muted-foreground">12 of 50 GB</span>
        </div>
        <Progress value={24} aria-labelledby="progress-storage" />
      </div>
      <div className="grid gap-2">
        <span id="progress-import" className="text-sm">
          Importing…
        </span>
        <Progress aria-labelledby="progress-import" />
      </div>
    </div>
  );
}
