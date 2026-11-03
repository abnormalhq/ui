"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function SonnerDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Toaster />
      <Button variant="outline" onClick={() => toast("Draft saved")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Message sent")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Could not send")}>
        Error
      </Button>
    </div>
  );
}
