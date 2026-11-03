import { NativeSelect } from "@/components/ui/native-select";

export default function NativeSelectDemo() {
  return (
    <NativeSelect aria-label="Plan" defaultValue="team" className="max-w-56">
      <option value="starter">Starter</option>
      <option value="team">Team</option>
      <option value="business">Business</option>
    </NativeSelect>
  );
}
