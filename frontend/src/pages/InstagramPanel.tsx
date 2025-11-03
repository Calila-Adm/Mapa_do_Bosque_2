import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import InstagramFilterSidebar, { type InstagramFilterValues } from '../components/features/InstagramFilterSidebar';
import { WBRChart } from '@/components/features/WBRChart';
import { useWBRPage } from '@/hooks/useWBRPage';
import { isWBRData, isWBRError, instagramApi } from '@/services/wbrApi';
import type { UserFilters, InstagramKPIs, InstagramTopPost } from '@/services/wbrApi';

export function InstagramPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [filters, setFilters] = useState<InstagramFilterValues>({
    date: '',
    shopping: '',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estados para dados do Instagram
  const [kpis, setKpis] = useState<InstagramKPIs | null>(null);
  const [topPosts, setTopPosts] = useState<InstagramTopPost[]>([]);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);

  const handleFilterChange = (newFilters: InstagramFilterValues) => {
    setFilters(newFilters);
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

  // Converte InstagramFilterValues para UserFilters (formato da API)
  const apiFilters = useMemo<UserFilters | undefined>(() => {
    const result: UserFilters = {};

    if (filters.date) result.data_referencia = filters.date;
    if (filters.shopping) result.shopping = filters.shopping;

    // Retorna undefined se não houver filtros
    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Hook que carrega os dados do Instagram com os filtros aplicados
  const { data: pageData, loading, error, loadingGraficos, progress } = useWBRPage('dashboard_instagram', apiFilters);

  // Busca KPIs do Instagram quando os filtros mudam
  useEffect(() => {
    if (!filters.date) return;

    const fetchKPIs = async () => {
      setLoadingKpis(true);
      setKpisError(null);
      try {
        const data = await instagramApi.getKPIs({
          data_referencia: filters.date,
          shopping: filters.shopping || undefined,
        });
        setKpis(data);
      } catch (err) {
        setKpisError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoadingKpis(false);
      }
    };

    fetchKPIs();
  }, [filters.date, filters.shopping]);

  // Busca Top Posts quando os filtros mudam
  useEffect(() => {
    // Só busca se a data estiver definida
    if (!filters.date) {
      return;
    }

    const fetchTopPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const data = await instagramApi.getTopPosts({
          data_referencia: filters.date,
          shopping: filters.shopping || undefined,
          limit: 3,
        });
        setTopPosts(data.posts || []);
      } catch (err) {
        setPostsError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTopPosts();
  }, [filters.date, filters.shopping]);

  // Calcula os KPIs formatados
  const formattedKPIs = useMemo(() => {
    if (!kpis || !kpis.engagement || kpis.engagement.length === 0) {
      return {
        seguidores: 0,
        engajamentoTotalMes: 0,
        engajamentoMedioDia: 0,
        alcanceTotalMes: 0,
        alcanceMedioDia: 0,
      };
    }

    const engagement = kpis.engagement[0];

    // Backend agora retorna:
    // - engajamento_total_mes: soma acumulada do dia 1 até a data selecionada
    // - engajamento_medio_dia: engajamento_total_mes / dias_disponiveis
    // - alcance_total_mes: soma acumulada de alcance do dia 1 até a data selecionada
    // - alcance_medio_dia: alcance_total_mes / dias_disponiveis
    const engajamentoTotalMes = engagement.engajamento_total_mes || 0;
    const engajamentoMedioDia = engagement.engajamento_medio_dia || 0;
    const alcanceTotalMes = engagement.alcance_total_mes || 0;
    const alcanceMedioDia = engagement.alcance_medio_dia || 0;

    // Busca o número de seguidores (follower_demographics)
    // Esta métrica retorna a quantidade TOTAL de seguidores da conta naquele dia específico
    // Não é uma soma, é o valor absoluto de seguidores no dia da data_referencia
    // IMPORTANTE: O backend retorna os campos em minúsculas (metrica, não METRICA)
    const seguidoresData = kpis.seguidores?.find(s =>
      (s as any).metrica === 'follower_demographics' || s.METRICA === 'follower_demographics'
    );

    // O value já contém o total de seguidores naquele dia
    let totalSeguidores: number = 0;
    if (seguidoresData?.value) {
      if (typeof seguidoresData.value === 'number') {
        // Valor direto
        totalSeguidores = seguidoresData.value;
      } else if (typeof seguidoresData.value === 'object' && seguidoresData.value !== null) {
        // Se for objeto (dados demográficos), soma os valores para obter o total
        // Ex: { "18-24": 1000, "25-34": 1500, ... } = 2500 seguidores total
        totalSeguidores = Object.values(seguidoresData.value).reduce((acc: number, val: any) => {
          const numVal = typeof val === 'number' ? val : 0;
          return acc + numVal;
        }, 0);
      }
    }

    return {
      seguidores: totalSeguidores,
      engajamentoTotalMes: engajamentoTotalMes,
      engajamentoMedioDia: engajamentoMedioDia,
      alcanceTotalMes: alcanceTotalMes,
      alcanceMedioDia: alcanceMedioDia,
    };
  }, [kpis]);

  return (
    <div className="flex min-h-screen bg-background relative">
      <InstagramFilterSidebar
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
              onClick={() => navigate('/operations')}
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Operações
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
            Instagram Analytics
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {filters.shopping
              ? `Shopping: ${filters.shopping}`
              : 'Análise de desempenho dos perfis do Instagram'}
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Total de Seguidores
              </p>
              {loadingKpis ? (
                <div className="animate-pulse">
                  <div className="h-9 bg-gray-200 rounded mb-2"></div>
                </div>
              ) : kpisError ? (
                <p className="text-sm text-red-500">{kpisError}</p>
              ) : (
                <p className="text-3xl font-bold text-foreground mb-2">
                  {formattedKPIs.seguidores.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Engajamento Total do Mês
              </p>
              {loadingKpis ? (
                <div className="animate-pulse">
                  <div className="h-9 bg-gray-200 rounded mb-2"></div>
                </div>
              ) : kpisError ? (
                <p className="text-sm text-red-500">{kpisError}</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {formattedKPIs.engajamentoTotalMes.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Média/dia: {formattedKPIs.engajamentoMedioDia.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Alcance Total do Mês
              </p>
              {loadingKpis ? (
                <div className="animate-pulse">
                  <div className="h-9 bg-gray-200 rounded mb-2"></div>
                </div>
              ) : kpisError ? (
                <p className="text-sm text-red-500">{kpisError}</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {formattedKPIs.alcanceTotalMes.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Média/dia: {formattedKPIs.alcanceMedioDia.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

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

        {/* Top 3 Posts Section - Pódio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Top 3 Posts do Mês com Melhor Engajamento</h2>

          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : postsError ? (
            <Card className="border-red-500">
              <CardContent className="p-6">
                <p className="text-red-600">Erro ao carregar posts: {postsError}</p>
              </CardContent>
            </Card>
          ) : topPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Foto / Vídeo Expirada ou não houve Posts o suficiente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPosts.map((post, index) => {
                // Define as medalhas para cada posição
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[index];

                // Função para detectar se a imagem falhou ao carregar
                const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EFoto Expirada%3C/text%3E%3C/svg%3E';
                };

                return (
                  <Card
                    key={index}
                    className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                    onClick={() => window.open(post.link_insta, '_blank')}
                  >
                    {/* Medalha de Posição */}
                    <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border-2 border-primary/20">
                      {medal}
                    </div>

                    {/* Imagem do Post */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={post.link_foto || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESem Imagem%3C/text%3E%3C/svg%3E'}
                        alt="Post do Instagram"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={handleImageError}
                      />
                      {/* Overlay com Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Informações do Post */}
                    <CardContent className="p-4 space-y-3">
                      {/* KPIs em uma única linha */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {/* Likes */}
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold text-foreground">{(post.total_likes || 0).toLocaleString()}</span>
                        </div>

                        {/* Comentários */}
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs font-semibold text-foreground">{(post.total_comentarios || 0).toLocaleString()}</span>
                        </div>

                        {/* Compartilhamentos */}
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span className="text-xs font-semibold text-foreground">{(post.total_compartilhamentos || 0).toLocaleString()}</span>
                        </div>

                        {/* Salvamentos */}
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span className="text-xs font-semibold text-foreground">{(post.total_salvos || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Engajamento Total */}
                      <div className="pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Engajamento Total
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {(post.engajamento_total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Verifica se houve erro
              if (isWBRError(graficoData)) {
                return (
                  <Card key={graficoId} className="w-full border-red-500">
                    <CardContent className="p-6">
                      <p className="text-red-600">
                        Erro ao carregar gráfico {graficoId}: {graficoData.error}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              // Renderiza o gráfico se dados válidos
              if (isWBRData(graficoData)) {
                // Mapeia os IDs dos gráficos para títulos e unidades
                const chartConfig: Record<string, { titulo: string; unidade: string }> = {
                  instagram_likes: { titulo: 'Instagram - Likes', unidade: 'Likes' },
                  instagram_alcance: { titulo: 'Instagram - Alcance', unidade: 'Alcance' },
                  instagram_impressoes: { titulo: 'Instagram - Impressões', unidade: 'Impressões' },
                  instagram_engajamento: { titulo: 'Instagram - Engajamento Total', unidade: 'Engajamento' },
                  instagram_posts: { titulo: 'Instagram - Total de Posts', unidade: 'Posts' },
                };

                const config = chartConfig[graficoId] || { titulo: graficoId, unidade: '' };

                return (
                  <Card key={graficoId} className="w-full">
                    <CardContent className="p-6">
                      <WBRChart
                        data={graficoData}
                        titulo={config.titulo}
                        unidade={config.unidade}
                        dataReferencia={new Date()}
                        isRGM={false}
                      />
                    </CardContent>
                  </Card>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default InstagramPanel;
