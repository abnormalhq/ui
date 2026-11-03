"use client";

import { useState } from "react";
import { InputGroup, InputGroupButton, InputGroupInput, InputGroupSuffix } from "@/components/ui/input-group";

export default function InputGroupDemo() {
  const [password, setPassword] = useState("correct horse");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput aria-label="Address" placeholder="name" />
        <InputGroupSuffix>@example.com</InputGroupSuffix>
      </InputGroup>
      <InputGroup>
        <InputGroupInput
          aria-label="Password"
          type={visible ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <InputGroupButton aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"}
        </InputGroupButton>
        <InputGroupButton
          onClick={async () => {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </InputGroupButton>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Disabled" disabled defaultValue="Disabled" />
        <InputGroupButton disabled>Copy</InputGroupButton>
      </InputGroup>
    </div>
  );
}
