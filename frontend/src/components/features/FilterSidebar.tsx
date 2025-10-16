import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DateFilter from './filters/DateFilter';
import ShoppingFilter from './filters/ShoppingFilter';
import RamoFilter from './filters/RamoFilter';
import CategoriaFilter from './filters/CategoriaFilter';
import LojaFilter from './filters/LojaFilter';
import leftArrowIcon from '../../assets/Left Array.svg';
import rightArrowIcon from '../../assets/Right Array.svg';

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

export function FilterSidebar({ onFilterChange, isCollapsed, onToggle }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    date: '',
    shopping: '',
    ramo: '',
    categoria: '',
    loja: '',
  });

  const handleFilterChange = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      date: '',
      shopping: '',
      ramo: '',
      categoria: '',
      loja: '',
    };
    setFilters(clearedFilters);
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
        />

        {/* Categoria Filter */}
        <CategoriaFilter
          value={filters.categoria}
          onChange={(value) => handleFilterChange('categoria', value)}
        />

        {/* Loja Filter */}
        <LojaFilter
          value={filters.loja}
          onChange={(value) => handleFilterChange('loja', value)}
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
