import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import FilterSidebar, { type FilterValues } from '../components/features/FilterSidebar';
import { WBRChart } from '@/components/features/WBRChart';
import { useWBRPage } from '@/hooks/useWBRPage';
import { isWBRData, isWBRError } from '@/services/wbrApi';
import type { UserFilters } from '@/services/wbrApi';

export function OperationsPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [filters, setFilters] = useState<FilterValues>({
    date: '',
    shopping: '',
    ramo: '',
    categoria: '',
    loja: '',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Converte FilterValues para UserFilters (formato da API)
  // Remove valores vazios para não enviar undefined na URL
  const apiFilters = useMemo<UserFilters | undefined>(() => {
    const result: UserFilters = {};

    if (filters.date) result.data_referencia = filters.date;
    if (filters.shopping) result.shopping = filters.shopping;
    if (filters.ramo) result.ramo = filters.ramo;
    if (filters.categoria) result.categoria = filters.categoria;
    if (filters.loja) result.loja = filters.loja;

    // Retorna undefined se não houver filtros
    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Hook que carrega os dados com os filtros aplicados
  const { data: pageData, loading, error, loadingGraficos, progress } = useWBRPage('dashboard_vendas', apiFilters);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    console.log('Filtros atualizados:', newFilters);
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

        {/* Barra de progresso fixa no topo (só aparece durante carregamento) */}
        {loading && progress.total > 0 && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b">
            <div className="h-1.5 bg-gray-200">
              <div
                className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
              ></div>
            </div>
            <div className="px-4 py-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Carregando gráficos... {progress.loaded}/{progress.total} ({Math.round((progress.loaded / progress.total) * 100)}%)</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="w-full border-red-500">
            <CardContent className="p-6">
              <p className="text-red-600">Erro ao carregar dados: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Gráficos WBR - Renderizados dinamicamente com loading individual */}
        {pageData && (
          <div className="space-y-6 w-full">
            {Object.entries(pageData).map(([graficoId, graficoData]) => {
              // Verifica se ainda está carregando este gráfico
              if (loadingGraficos[graficoId]) {
                return (
                  <Card key={graficoId} className="w-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                          <p className="text-muted-foreground">Carregando {graficoId}...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Verifica se é um erro ou dados válidos
              if (isWBRError(graficoData)) {
                // Renderiza card de erro para este gráfico específico
                return (
                  <Card key={graficoId} className="w-full border-yellow-500">
                    <CardContent className="p-6">
                      <div className="text-yellow-600">
                        <p className="font-semibold">Erro ao carregar gráfico: {graficoId}</p>
                        <p className="text-sm mt-2">{graficoData.error}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Se é um dado válido WBR, renderiza o gráfico
              if (isWBRData(graficoData)) {
                // Por enquanto, vamos usar o ID do gráfico como título
                // Isso será melhorado quando o backend enviar as configurações
                const titulo = graficoId
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <Card key={graficoId} className="w-full">
                    <CardContent className="p-6">
                      <WBRChart
                        data={graficoData}
                        titulo={titulo}
                        unidade="R$" // Valor padrão, será melhorado com config do backend
                        dataReferencia={new Date()}
                        isRGM={graficoId.includes('rgm')} // Detecta se é RGM pelo ID
                      />
                    </CardContent>
                  </Card>
                );
              }

              // Se não é nem erro nem dados válidos, ignora
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperationsPanel;
