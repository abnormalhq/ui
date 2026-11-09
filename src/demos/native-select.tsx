import { NativeSelect } from "@/components/ui/native-select";

const plans = (
  <>
    <option value="starter">Starter</option>
    <option value="team">Team</option>
    <option value="business">Business</option>
  </>
);

export default function NativeSelectDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NativeSelect size="sm" aria-label="Plan, small" defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
      <NativeSelect aria-label="Plan" defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
      <NativeSelect size="lg" aria-label="Plan, large" defaultValue="team" className="w-36">
        {plans}
      </NativeSelect>
    </div>
  );
}
