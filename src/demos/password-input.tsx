"use client";

import { useState } from "react";
import { InputGroupButton } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const generate = () => Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => n.toString(36)).join("-");

export const defaultCopy = {
  currentPassword: "Current password",
  newPassword: "New password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  show: "Show",
  hide: "Hide",
  generate: "Generate",
};

export default function PasswordInputDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password-input-current">{copy.currentPassword}</Label>
        <PasswordInput
          id="password-input-current"
          autoComplete="current-password"
          showLabel={copy.showPassword}
          hideLabel={copy.hidePassword}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-input-new">{copy.newPassword}</Label>
        <PasswordInput
          id="password-input-new"
          autoComplete="new-password"
          size="lg"
          toggle="text"
          showLabel={copy.show}
          hideLabel={copy.hide}
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
              {copy.generate}
            </InputGroupButton>
          }
        />
      </div>
    </div>
  );
}
