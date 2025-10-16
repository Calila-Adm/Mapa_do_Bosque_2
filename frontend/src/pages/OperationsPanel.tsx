import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterSidebar, { type FilterValues } from '../components/features/FilterSidebar';

export function OperationsPanel() {
  const [filters, setFilters] = useState<FilterValues>({
    date: '',
    shopping: '',
    ramo: '',
    categoria: '',
    loja: '',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    console.log('Filtros atualizados:', newFilters);
    // Aqui futuramente você vai chamar a API com os filtros
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Dados mocados para os KPIs
  const kpiData = [
    { title: 'Vendas Totais', value: 'R$ 1.234.567', change: '+12.5%', positive: true },
    { title: 'Ticket Médio', value: 'R$ 287,50', change: '+5.2%', positive: true },
    { title: 'Lojas Ativas', value: '156', change: '+3', positive: true },
    { title: 'Taxa de Conversão', value: '68%', change: '-2.1%', positive: false },
  ];

  return (
    <div className="flex min-h-screen bg-background relative">
      <FilterSidebar
        onFilterChange={handleFilterChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div
        className={cn(
          'flex-1 p-8 flex flex-col gap-6 transition-all duration-300 box-border',
          isSidebarCollapsed ? 'ml-[60px]' : 'ml-[280px]'
        )}
      >
        {/* Header */}
        <header className="flex flex-col items-center justify-center mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Painel de Operações
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {filters.shopping
              ? `Shopping: ${filters.shopping}`
              : 'Visualização geral de todos os shoppings'}
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {kpiData.map((kpi, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {kpi.value}
                </p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    kpi.positive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Lojas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground italic">
                  Gráfico em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OperationsPanel;
