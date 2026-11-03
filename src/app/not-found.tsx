import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-heading";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionTitle asChild>
        <h1>Nothing here</h1>
      </SectionTitle>
      <p className="mt-4 mb-6 text-lg text-muted-foreground">This page or registry item does not exist.</p>
      <Button asChild>
        <Link href="/">Back to the overview</Link>
      </Button>
    </div>
  );
}
