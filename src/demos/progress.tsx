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
        <div className="flex justify-between text-sm">
          <span id="progress-support">support@example.com</span>
          <span className="text-muted-foreground">8.6 of 10 GB</span>
        </div>
        <Progress value={86} tone="warning" aria-labelledby="progress-support" />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between text-sm">
          <span id="progress-sales">sales@example.com</span>
          <span className="text-muted-foreground">9.9 of 10 GB</span>
        </div>
        <Progress value={99} tone="destructive" aria-labelledby="progress-sales" />
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
