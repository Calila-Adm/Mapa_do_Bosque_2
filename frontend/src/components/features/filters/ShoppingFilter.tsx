import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface ShoppingFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const shoppingOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'iguatemi-bosque', label: 'Iguatemi Bosque' },
  { value: 'grao-para', label: 'Grão-Pará' },
  { value: 'bosque-dos-ipes', label: 'Bosque dos Ipês' },
];

export function ShoppingFilter({ value, onChange }: ShoppingFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="shopping-filter">Shopping</Label>
      <Select
        id="shopping-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {shoppingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export default ShoppingFilter;
