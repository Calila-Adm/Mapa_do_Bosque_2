import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface LojaFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function LojaFilter({ value, onChange }: LojaFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="loja-filter">Loja</Label>
      <Select
        id="loja-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled
      >
        <option value="">Em breve...</option>
      </Select>
    </div>
  );
}

export default LojaFilter;
