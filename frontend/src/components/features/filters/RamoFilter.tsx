import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface RamoFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function RamoFilter({ value, onChange }: RamoFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="ramo-filter">Ramo</Label>
      <Select
        id="ramo-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled
      >
        <option value="">Em breve...</option>
      </Select>
    </div>
  );
}

export default RamoFilter;
