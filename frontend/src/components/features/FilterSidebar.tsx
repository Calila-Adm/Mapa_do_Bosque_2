import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DateFilter from './filters/DateFilter';
import ShoppingFilter from './filters/ShoppingFilter';
import RamoFilter from './filters/RamoFilter';
import CategoriaFilter from './filters/CategoriaFilter';
import LojaFilter from './filters/LojaFilter';
import leftArrowIcon from '../../assets/Left Array.svg';
import rightArrowIcon from '../../assets/Right Array.svg';
import type { UserFilters } from '@/services/wbrApi';
import { wbrApi } from '@/services/wbrApi';

export interface FilterValues {
  date: string;
  shopping: string;
  ramo: string;
  categoria: string;
  loja: string;
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterValues) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const STORAGE_KEY = 'wbr-filter-values';

// Função para carregar filtros do localStorage
const loadFiltersFromStorage = (): Partial<FilterValues> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar filtros do localStorage:', error);
  }
  return null;
};

// Função para salvar filtros no localStorage
const saveFiltersToStorage = (filters: FilterValues) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Erro ao salvar filtros no localStorage:', error);
  }
};

export function FilterSidebar({ onFilterChange, isCollapsed, onToggle }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    date: '', // Será preenchida com a última data disponível
    shopping: '',
    ramo: '',
    categoria: '',
    loja: '',
  });
  const [defaultDate, setDefaultDate] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Busca a última data disponível ao montar o componente
  useEffect(() => {
    const loadDefaultDate = async () => {
      try {
        const dates = await wbrApi.getAvailableDates();
        if (dates.length > 0) {
          const latestDate = dates[0]; // Primeira data (mais recente)
          setDefaultDate(latestDate);

          // Tenta carregar filtros salvos do localStorage
          const storedFilters = loadFiltersFromStorage();

          let newFilters: FilterValues;
          if (storedFilters) {
            // Se há filtros salvos, usa eles mas garante que tenha uma data
            newFilters = {
              date: storedFilters.date || latestDate,
              shopping: storedFilters.shopping || '',
              ramo: storedFilters.ramo || '',
              categoria: storedFilters.categoria || '',
              loja: storedFilters.loja || '',
            };
          } else {
            // Se não há filtros salvos, usa apenas a data padrão
            newFilters = { ...filters, date: latestDate };
          }

          setFilters(newFilters);
          setIsInitialized(true);
          // Notifica imediatamente com a data carregada
          onFilterChange?.(newFilters);
        }
      } catch (error) {
        console.error('Erro ao carregar data padrão:', error);
      }
    };

    loadDefaultDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Apenas na montagem

  const handleFilterChange = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value };

    // Se está limpando um filtro pai na cascata, limpa os filtros filhos também
    if (field === 'shopping' && value === '') {
      newFilters.ramo = '';
      newFilters.categoria = '';
      newFilters.loja = '';
    } else if (field === 'ramo' && value === '') {
      newFilters.categoria = '';
      newFilters.loja = '';
    } else if (field === 'categoria' && value === '') {
      newFilters.loja = '';
    }

    setFilters(newFilters);
    // Salva os filtros no localStorage após qualquer mudança
    if (isInitialized) {
      saveFiltersToStorage(newFilters);
    }
    onFilterChange?.(newFilters);
  };

  // Converte FilterValues para UserFilters para passar aos componentes de filtro
  const appliedFiltersForRamo = useMemo<Partial<UserFilters>>(() => {
    const result: Partial<UserFilters> = {};
    if (filters.shopping) result.shopping = filters.shopping;
    return result;
  }, [filters.shopping]);

  const appliedFiltersForCategoria = useMemo<Partial<UserFilters>>(() => {
    const result: Partial<UserFilters> = {};
    if (filters.shopping) result.shopping = filters.shopping;
    if (filters.ramo) result.ramo = filters.ramo;
    return result;
  }, [filters.shopping, filters.ramo]);

  const appliedFiltersForLoja = useMemo<Partial<UserFilters>>(() => {
    const result: Partial<UserFilters> = {};
    if (filters.shopping) result.shopping = filters.shopping;
    if (filters.ramo) result.ramo = filters.ramo;
    if (filters.categoria) result.categoria = filters.categoria;
    return result;
  }, [filters.shopping, filters.ramo, filters.categoria]);

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      date: defaultDate, // Ao limpar, volta para a última data disponível
      shopping: '',
      ramo: '',
      categoria: '',
      loja: '',
    };
    setFilters(clearedFilters);
    // Salva os filtros limpos no localStorage
    saveFiltersToStorage(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-secondary border-r border-border shadow-sm',
        'flex flex-col gap-4 overflow-y-auto overflow-x-hidden',
        'transition-all duration-300',
        isCollapsed ? 'w-[60px] p-2' : 'w-[280px] p-6'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute z-10 flex items-center justify-center',
          'w-6 h-6 bg-transparent border-none cursor-pointer',
          'transition-transform duration-150',
          'hover:scale-110',
          isCollapsed ? 'top-6 left-1/2 -translate-x-1/2' : 'top-6 right-4'
        )}
        title={isCollapsed ? 'Expandir filtros' : 'Recolher filtros'}
      >
        <img
          src={isCollapsed ? rightArrowIcon : leftArrowIcon}
          alt={isCollapsed ? 'Expandir' : 'Recolher'}
          className="w-full h-full object-contain pointer-events-none"
        />
      </button>

      {/* Filter Content */}
      <div
        className={cn(
          'flex flex-col gap-4 mt-12 transition-opacity duration-300',
          isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
        )}
      >
        <h2 className="text-xl font-bold text-foreground mb-2 pb-2 border-b-2 border-primary">
          Filtros
        </h2>

        {/* Data Filter */}
        <DateFilter
          value={filters.date}
          onChange={(value) => handleFilterChange('date', value)}
        />

        {/* Shopping Filter */}
        <ShoppingFilter
          value={filters.shopping}
          onChange={(value) => handleFilterChange('shopping', value)}
        />

        {/* Ramo Filter */}
        <RamoFilter
          value={filters.ramo}
          onChange={(value) => handleFilterChange('ramo', value)}
          appliedFilters={appliedFiltersForRamo}
        />

        {/* Categoria Filter */}
        <CategoriaFilter
          value={filters.categoria}
          onChange={(value) => handleFilterChange('categoria', value)}
          appliedFilters={appliedFiltersForCategoria}
        />

        {/* Loja Filter */}
        <LojaFilter
          value={filters.loja}
          onChange={(value) => handleFilterChange('loja', value)}
          appliedFilters={appliedFiltersForLoja}
        />

        {/* Clear Filters Button */}
        <Button
          onClick={handleClearFilters}
          className="mt-4"
          variant="default"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}

export default FilterSidebar;
