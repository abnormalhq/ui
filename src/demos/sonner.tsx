"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const defaultCopy = {
  draftSaved: "Draft saved",
  default: "Default",
  messageSent: "Message sent",
  success: "Success",
  couldNotSend: "Could not send",
  error: "Error",
  notifications: "Notifications",
  closeToast: "Close toast",
};

export default function SonnerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Toaster
        containerAriaLabel={copy.notifications}
        customAriaLabel={copy.notifications}
        toastOptions={{ closeButtonAriaLabel: copy.closeToast }}
      />
      <Button variant="outline" onClick={() => toast(copy.draftSaved)}>
        {copy.default}
      </Button>
      <Button variant="outline" onClick={() => toast.success(copy.messageSent)}>
        {copy.success}
      </Button>
      <Button variant="outline" onClick={() => toast.error(copy.couldNotSend)}>
        {copy.error}
      </Button>
    </div>
  );
}
