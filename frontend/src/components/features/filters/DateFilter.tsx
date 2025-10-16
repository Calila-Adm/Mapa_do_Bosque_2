import type { ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove todos os caracteres que não são números ou barra
    const cleaned = input.replace(/[^\d/]/g, '');

    // Limita o comprimento máximo (DD/MM/YYYY = 10 caracteres)
    const limited = cleaned.slice(0, 10);

    // Formata automaticamente com barras
    let formatted = limited;
    if (limited.length >= 3 && limited.charAt(2) !== '/') {
      formatted = limited.slice(0, 2) + '/' + limited.slice(2);
    }
    if (formatted.length >= 6 && formatted.charAt(5) !== '/') {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }

    onChange(formatted);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="date-filter">Data</Label>
      <Input
        id="date-filter"
        type="text"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={handleDateChange}
        maxLength={10}
      />
    </div>
  );
}

export default DateFilter;
