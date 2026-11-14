"use client";

import { useState } from "react";
import { InputGroupButton } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const generate = () => Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => n.toString(36)).join("-");

export default function PasswordInputDemo() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password-input-current">Current password</Label>
        <PasswordInput
          id="password-input-current"
          autoComplete="current-password"
          showLabel="Show password"
          hideLabel="Hide password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-input-new">New password</Label>
        <PasswordInput
          id="password-input-new"
          autoComplete="new-password"
          size="lg"
          toggle="text"
          showLabel="Show"
          hideLabel="Hide"
          visible={visible}
          onVisibleChange={setVisible}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          actions={
            <InputGroupButton
              onClick={() => {
                setPassword(generate());
                setVisible(true);
              }}
            >
              Generate
            </InputGroupButton>
          }
        />
      </div>
    </div>
  );
}
