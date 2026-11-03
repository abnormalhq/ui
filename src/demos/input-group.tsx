import { InputGroup, InputGroupButton, InputGroupInput, InputGroupSuffix } from "@/components/ui/input-group";

export default function InputGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput aria-label="Address" placeholder="name" />
        <InputGroupSuffix>@example.com</InputGroupSuffix>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Password" type="password" defaultValue="correct horse" />
        <InputGroupButton>Show</InputGroupButton>
        <InputGroupButton>Copy</InputGroupButton>
      </InputGroup>
    </div>
  );
}
