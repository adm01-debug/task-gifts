import { SelectItem } from "@/components/ui/select";

interface AllSelectItemProps {
  label?: string;
}

export function AllSelectItem({ label = "Todos" }: AllSelectItemProps) {
  return <SelectItem value="all">{label}</SelectItem>;
}
