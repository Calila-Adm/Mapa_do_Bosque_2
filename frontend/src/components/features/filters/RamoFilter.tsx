import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { wbrApi } from '@/services/wbrApi';
import type { UserFilters } from '@/services/wbrApi';

interface RamoFilterProps {
  value: string;
  onChange: (value: string) => void;
  appliedFilters?: Partial<UserFilters>; // Filtros já aplicados (para cascata)
}

export function RamoFilter({ value, onChange, appliedFilters }: RamoFilterProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);

        let newOptions: string[] = [];

        // Se há filtro de shopping, usa a API filtrada
        if (appliedFilters && appliedFilters.shopping) {
          const data = await wbrApi.getFilteredOptions(appliedFilters);
          newOptions = data.ramos || [];
        } else {
          // Caso contrário, busca todas as opções
          const data = await wbrApi.getFilterOptions();
          newOptions = data.ramos;
        }

        setOptions(newOptions);

        setError(null);
      } catch (err) {
        console.error('Erro ao carregar ramos:', err);
        setError('Erro ao carregar opções');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [appliedFilters?.shopping]); // Recarrega quando shopping muda

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="ramo-filter">Ramo</Label>
      <Select
        id="ramo-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || error !== null}
      >
        {loading && <option value="">Carregando...</option>}
        {!loading && (
          <>
            <option value="">Todos os ramos</option>
            {options.map((ramo) => (
              <option key={ramo} value={ramo}>
                {ramo}
              </option>
            ))}
          </>
        )}
      </Select>
    </div>
  );
}

export default RamoFilter;
