import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { wbrApi } from '@/services/wbrApi';
import type { UserFilters } from '@/services/wbrApi';

interface CategoriaFilterProps {
  value: string;
  onChange: (value: string) => void;
  appliedFilters?: Partial<UserFilters>; // Filtros já aplicados (para cascata)
}

export function CategoriaFilter({ value, onChange, appliedFilters }: CategoriaFilterProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);

        // Se há filtros aplicados (ramo), usa a API filtrada
        if (appliedFilters && (appliedFilters.shopping || appliedFilters.ramo)) {
          const data = await wbrApi.getFilteredOptions(appliedFilters);
          setOptions(data.categorias || []);
        } else {
          // Caso contrário, busca todas as opções
          const data = await wbrApi.getFilterOptions();
          setOptions(data.categorias);
        }

        setError(null);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Erro ao carregar opções');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [appliedFilters?.shopping, appliedFilters?.ramo]); // Recarrega quando shopping ou ramo mudam

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="categoria-filter">Categoria</Label>
      <Select
        id="categoria-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || error !== null}
      >
        {loading && <option value="">Carregando...</option>}
        {!loading && (
          <>
            <option value="">Todas as categorias</option>
            {options.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </>
        )}
      </Select>
    </div>
  );
}

export default CategoriaFilter;
