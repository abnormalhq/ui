"use client";

import { useState } from "react";
import { InputGroup, InputGroupButton, InputGroupInput, InputGroupSuffix } from "@/components/ui/input-group";

export const defaultCopy = {
  address: "Address",
  name: "name",
  password: "Password",
  hide: "Hide",
  show: "Show",
  copied: "Copied",
  copy: "Copy",
  smallAddress: "Address, small",
  largeAddress: "Address, large",
  disabled: "Disabled",
};

export default function InputGroupDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [password, setPassword] = useState("correct horse");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput aria-label={copy.address} placeholder={copy.name} />
        <InputGroupSuffix>@example.com</InputGroupSuffix>
      </InputGroup>
      <InputGroup>
        <InputGroupInput
          aria-label={copy.password}
          type={visible ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <InputGroupButton aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? copy.hide : copy.show}
        </InputGroupButton>
        <InputGroupButton
          onClick={() => {
            void navigator.clipboard.writeText(password).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? copy.copied : copy.copy}
        </InputGroupButton>
      </InputGroup>
      <InputGroup size="sm">
        <InputGroupInput aria-label={copy.smallAddress} placeholder={copy.name} className="pl-2 text-sm" />
        <InputGroupButton>{copy.copy}</InputGroupButton>
      </InputGroup>
      <InputGroup size="lg">
        <InputGroupInput aria-label={copy.largeAddress} placeholder={copy.name} />
        <InputGroupSuffix>@example.com</InputGroupSuffix>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label={copy.disabled} disabled defaultValue="Disabled" />
        <InputGroupButton disabled>{copy.copy}</InputGroupButton>
      </InputGroup>
    </div>
  );
}
