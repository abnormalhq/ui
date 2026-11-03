import { cn } from "@/lib/utils";

export default function UtilsDemo() {
  return (
    <div className="grid w-full gap-2 font-mono text-sm">
      <p className="text-muted-foreground">cn(&quot;rounded-panel p-2&quot;, &quot;rounded-none&quot;)</p>
      <p>{cn("rounded-panel p-2", "rounded-none")}</p>
    </div>
  );
}
