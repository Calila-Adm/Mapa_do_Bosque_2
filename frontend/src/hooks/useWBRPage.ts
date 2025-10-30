/**
 * useWBRPage Hook
 * React hook para carregar dados de uma página WBR (múltiplos gráficos)
 * CARREGAMENTO SEQUENCIAL - Um gráfico por vez
 */

import { useState, useEffect, useCallback } from 'react';
import { wbrApi } from '../services/wbrApi';
import type { PageWBRData, UserFilters } from '../services/wbrApi';

interface UseWBRPageResult {
  /**
   * Dados da página (todos os gráficos) - carrega progressivamente
   */
  data: PageWBRData | null;

  /**
   * Estado de carregamento global (true enquanto há gráficos sendo carregados)
   */
  loading: boolean;

  /**
   * Erro global se houver
   */
  error: string | null;

  /**
   * Estado de loading por gráfico específico
   */
  loadingGraficos: Record<string, boolean>;

  /**
   * Progresso do carregamento (ex: "3/10 gráficos carregados")
   */
  progress: { loaded: number; total: number };

  /**
   * Função para recarregar dados
   */
  refetch: () => Promise<void>;
}

/**
 * Hook para carregar dados WBR de uma página completa
 * CARREGAMENTO SEQUENCIAL - Cada gráfico é carregado um por vez
 *
 * @param pageId - Identificador da página/dashboard
 * @param filters - Filtros aplicados pelo usuário (opcional)
 * @returns Objeto com data, loading, error, loadingGraficos, progress, refetch
 *
 * @example
 * ```tsx
 * function DashboardVendas() {
 *   const filters = { shopping: 'SIG', data_referencia: '2025-08-20' };
 *   const { data, loading, error, loadingGraficos, progress } = useWBRPage('dashboard_vendas', filters);
 *
 *   return (
 *     <div>
 *       <p>Progresso: {progress.loaded}/{progress.total}</p>
 *       {data && Object.entries(data).map(([id, grafico]) => (
 *         <div key={id}>
 *           {loadingGraficos[id] ? <Loading /> : <GraficoComponent data={grafico} />}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWBRPage(pageId: string, filters?: UserFilters): UseWBRPageResult {
  const [data, setData] = useState<PageWBRData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingGraficos, setLoadingGraficos] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 });

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Primeiro, busca a configuração da página para saber quais gráficos carregar
      const pageConfigResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/wbr/page/${pageId}/config/`);

      if (!pageConfigResponse.ok) {
        throw new Error('Erro ao carregar configuração da página');
      }

      const pageConfig = await pageConfigResponse.json();
      const graficoIds: string[] = pageConfig.graficos || [];

      if (graficoIds.length === 0) {
        throw new Error('Página não possui gráficos configurados');
      }

      setProgress({ loaded: 0, total: graficoIds.length });

      // 2. Inicializa estado de loading para todos os gráficos
      const initialLoadingState: Record<string, boolean> = {};
      graficoIds.forEach(id => {
        initialLoadingState[id] = true;
      });
      setLoadingGraficos(initialLoadingState);

      // 3. Inicializa dados vazios para evitar piscar
      const initialData: PageWBRData = {};
      graficoIds.forEach(id => {
        initialData[id] = { error: 'loading', status: 'loading' };
      });
      setData(initialData);

      // 4. Carrega gráficos em LOTES DE 5 (paralelo limitado) para acelerar
      const BATCH_SIZE = 5;

      for (let i = 0; i < graficoIds.length; i += BATCH_SIZE) {
        const batch = graficoIds.slice(i, i + BATCH_SIZE);

        // Carrega lote em paralelo
        const batchPromises = batch.map(async (graficoId) => {
          try {
            console.log(`[useWBRPage] Carregando gráfico: ${graficoId} com filtros:`, filters);
            const graficoData = await wbrApi.getGrafico(graficoId, filters);

            // Atualiza apenas este gráfico específico
            setData(prev => ({
              ...prev,
              [graficoId]: graficoData
            }));
            setLoadingGraficos(prev => ({ ...prev, [graficoId]: false }));

            return { graficoId, success: true };
          } catch (err) {
            console.error(`[useWBRPage] Erro ao carregar gráfico ${graficoId}:`, err);

            // Em caso de erro, adiciona erro no resultado
            setData(prev => ({
              ...prev,
              [graficoId]: {
                error: err instanceof Error ? err.message : 'Erro desconhecido',
                status: 'error',
              }
            }));
            setLoadingGraficos(prev => ({ ...prev, [graficoId]: false }));

            return { graficoId, success: false };
          }
        });

        // Aguarda lote completo
        await Promise.all(batchPromises);

        // Atualiza progresso após cada lote
        setProgress({ loaded: Math.min(i + BATCH_SIZE, graficoIds.length), total: graficoIds.length });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar página';
      setError(errorMessage);
      console.error('[useWBRPage] Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [pageId, filters]);

  // Carrega dados automaticamente quando pageId ou filters mudarem
  // Usa JSON.stringify para comparar filtros corretamente
  useEffect(() => {
    if (pageId) {
      // Reset do estado ao mudar de página
      setData(null);
      setError(null);
      setLoadingGraficos({});
      setProgress({ loaded: 0, total: 0 });

      loadPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    loadingGraficos,
    progress,
    refetch: loadPage,
  };
}
