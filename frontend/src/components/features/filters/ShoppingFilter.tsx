import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { wbrApi } from '@/services/wbrApi';

interface ShoppingFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShoppingFilter({ value, onChange }: ShoppingFilterProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await wbrApi.getFilterOptions();
        setOptions([
          { value: '', label: 'Todos os shoppings' },
          ...data.shoppings
        ]);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar shoppings:', err);
        setError('Erro ao carregar opções');
        setOptions([{ value: '', label: 'Erro ao carregar' }]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="shopping-filter">Shopping</Label>
      <Select
        id="shopping-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || error !== null}
      >
        {loading && <option value="">Carregando...</option>}
        {!loading && options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export default ShoppingFilter;
