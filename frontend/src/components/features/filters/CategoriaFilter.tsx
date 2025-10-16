import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface CategoriaFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoriaFilter({ value, onChange }: CategoriaFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="categoria-filter">Categoria</Label>
      <Select
        id="categoria-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled
      >
        <option value="">Em breve...</option>
      </Select>
    </div>
  );
}

export default CategoriaFilter;
