"use client";

import { useState } from "react";
import { FieldMessage } from "@/components/ui/field-message";
import { InputOTP } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export default function InputOTPDemo() {
  const [code, setCode] = useState("");
  return (
    <div className="grid gap-2">
      <Label htmlFor="otp-code">Verification code</Label>
      <InputOTP
        id="otp-code"
        name="code"
        groupSize={3}
        value={code}
        onValueChange={setCode}
        aria-describedby="otp-hint"
      />
      <FieldMessage id="otp-hint" tone={code.length === 6 ? "ok" : "default"}>
        {code.length === 6 ? "Code entered" : "Enter the six digits from your authenticator app"}
      </FieldMessage>
    </div>
  );
}
