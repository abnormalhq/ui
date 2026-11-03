import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-56" aria-label="Plan">
        <SelectValue placeholder="Choose a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Plans</SelectLabel>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
