import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DateFilter from './filters/DateFilter';
import ShoppingFilter from './filters/ShoppingFilter';
import leftArrowIcon from '../../assets/Left Array.svg';
import rightArrowIcon from '../../assets/Right Array.svg';

export interface InstagramFilterValues {
  date: string;
  shopping: string;
}

interface InstagramFilterSidebarProps {
  onFilterChange?: (filters: InstagramFilterValues) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function InstagramFilterSidebar({ onFilterChange, isCollapsed, onToggle }: InstagramFilterSidebarProps) {
  // Função para obter a data de ontem no formato YYYY-MM-DD
  const getTodayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtrai 1 dia
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Define filtros iniciais
  const initialFilters: InstagramFilterValues = {
    date: getTodayDate(), // Data de ontem como padrão
    shopping: 'SCIB', // SCIB como padrão
  };

  const [filters, setFilters] = useState<InstagramFilterValues>(initialFilters);

  const handleFilterChange = (field: keyof InstagramFilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: InstagramFilterValues = {
      date: getTodayDate(), // Ao limpar, volta para data de ontem
      shopping: 'SCIB', // Ao limpar, volta para SCIB
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  // Notifica o pai sobre os filtros iniciais (com data de ontem) quando o componente monta
  useEffect(() => {
    onFilterChange?.(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Apenas na montagem

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

export default InstagramFilterSidebar;
