import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import FilterSidebar, { type FilterValues } from '../components/features/FilterSidebar';
import { WBRChart } from '@/components/features/WBRChart';
import type { WBRData } from '@/types/wbr.types';

export function OperationsPanel() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Dados mocados para os KPIs
  const kpiData = [
    { title: 'Vendas Totais', value: 'R$ 1.234.567', change: '+12.5%', positive: true },
    { title: 'Ticket Médio', value: 'R$ 287,50', change: '+5.2%', positive: true },
    { title: 'Lojas Ativas', value: '156', change: '+3', positive: true },
    { title: 'Taxa de Conversão', value: '68%', change: '-2.1%', positive: false },
  ];

  // Função para gerar dados mocados do WBR
  const gerarDadosMocadosWBR = (): WBRData => {
    // Gerar datas para semanas (últimas 8 semanas)
    const datasSemanasAtual: Date[] = [];
    const datasSemanasAnterior: Date[] = [];
    const hoje = new Date();

    for (let i = 7; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (i * 7));
      datasSemanasAtual.push(data);

      // Ano anterior
      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasSemanasAnterior.push(dataAnterior);
    }

    // Gerar datas para meses (12 meses)
    const datasMesesAtual: Date[] = [];
    const datasMesesAnterior: Date[] = [];

    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), i, 1);
      datasMesesAtual.push(data);

      const dataAnterior = new Date(data);
      dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
      datasMesesAnterior.push(dataAnterior);
    }

    // Gerar valores mocados para semanas (com tendência de crescimento)
    const valoresSemanasCY: { [key: string]: number } = {};
    const valoresSemanasAnterior: { [key: string]: number } = {};

    datasSemanasAtual.forEach((data, i) => {
      const baseValue = 45000 + Math.random() * 15000;
      const crescimento = i * 2000; // Tendência de crescimento
      valoresSemanasCY[data.toISOString()] = Math.round(baseValue + crescimento);
    });

    datasSemanasAnterior.forEach((data, i) => {
      const baseValue = 38000 + Math.random() * 12000;
      valoresSemanasAnterior[data.toISOString()] = Math.round(baseValue);
    });

    // Gerar valores mocados para meses
    const valoresMesesCY: { [key: string]: number } = {};
    const valoresMesesAnterior: { [key: string]: number } = {};

    datasMesesAtual.forEach((data, i) => {
      // Apenas até o mês atual
      if (i <= hoje.getMonth()) {
        const baseValue = 180000 + Math.random() * 50000;
        const crescimento = i * 8000;
        valoresMesesCY[data.toISOString()] = Math.round(baseValue + crescimento);
      }
    });

    datasMesesAnterior.forEach((data, i) => {
      if (i <= hoje.getMonth()) {
        const baseValue = 160000 + Math.random() * 40000;
        valoresMesesAnterior[data.toISOString()] = Math.round(baseValue);
      }
    });

    return {
      semanas_cy: {
        metric_value: valoresSemanasCY,
        index: datasSemanasAtual,
      },
      semanas_py: {
        metric_value: valoresSemanasAnterior,
        index: datasSemanasAnterior,
      },
      meses_cy: {
        metric_value: valoresMesesCY,
        index: datasMesesAtual,
      },
      meses_py: {
        metric_value: valoresMesesAnterior,
        index: datasMesesAnterior,
      },
      ano_atual: hoje.getFullYear(),
      ano_anterior: hoje.getFullYear() - 1,
      semana_parcial: false,
      mes_parcial_cy: true, // Mês atual está parcial
      mes_parcial_py: false,
    };
  };

  const dadosWBR = gerarDadosMocadosWBR();

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
        <header className="flex flex-col items-center justify-center mb-6 text-center relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <Button
              onClick={() => navigate('/instagram')}
              variant="outline"
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              Instagram
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sair
            </Button>
          </div>
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

        {/* Gráfico WBR - Full Width */}
        <Card className="w-full">
          <CardContent className="p-6">
            <WBRChart
              data={dadosWBR}
              titulo="Vendas Totais - WBR"
              unidade="R$"
              dataReferencia={new Date()}
              isRGM={false}
            />
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
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

          <Card>
            <CardHeader>
              <CardTitle>Ticket Médio por Período</CardTitle>
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
