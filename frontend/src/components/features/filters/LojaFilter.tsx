import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { wbrApi } from '@/services/wbrApi';
import type { UserFilters } from '@/services/wbrApi';

interface LojaFilterProps {
  value: string;
  onChange: (value: string) => void;
  appliedFilters?: Partial<UserFilters>; // Filtros já aplicados (para cascata)
}

export function LojaFilter({ value, onChange, appliedFilters }: LojaFilterProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);

        let newOptions: string[] = [];

        // Se há filtros aplicados (ramo ou categoria), usa a API filtrada
        if (appliedFilters && (appliedFilters.shopping || appliedFilters.ramo || appliedFilters.categoria)) {
          const data = await wbrApi.getFilteredOptions(appliedFilters);
          newOptions = data.lojas || [];
        } else {
          // Caso contrário, busca todas as opções
          const data = await wbrApi.getFilterOptions();
          newOptions = data.lojas;
        }

        setOptions(newOptions);

        setError(null);
      } catch (err) {
        console.error('Erro ao carregar lojas:', err);
        setError('Erro ao carregar opções');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [appliedFilters?.shopping, appliedFilters?.ramo, appliedFilters?.categoria]); // Recarrega quando shopping, ramo ou categoria mudam

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="loja-filter">Loja</Label>
      <Select
        id="loja-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || error !== null}
      >
        {loading && <option value="">Carregando...</option>}
        {!loading && (
          <>
            <option value="">Todas as lojas</option>
            {options.map((loja) => (
              <option key={loja} value={loja}>
                {loja}
              </option>
            ))}
          </>
        )}
      </Select>
    </div>
  );
}

export default LojaFilter;
