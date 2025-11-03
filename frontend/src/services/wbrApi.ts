/**
 * WBR API Service
 * Service para comunicação com a API WBR (Working Backwards Requirements)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Estrutura de dados WBR retornada pela API
 */
export interface WBRData {
  semanas_cy: {
    metric_value: Record<string, number>;
    index: string[];
  };
  semanas_py: {
    metric_value: Record<string, number>;
    index: string[];
  };
  meses_cy: {
    metric_value: Record<string, number>;
    index: string[];
  };
  meses_py: {
    metric_value: Record<string, number>;
    index: string[];
  };
  ano_atual: number;
  ano_anterior: number;
  semana_parcial: boolean;
  mes_parcial_cy: boolean;
  mes_parcial_py: boolean;
}

/**
 * Estrutura de resposta para página (múltiplos gráficos)
 */
export interface PageWBRData {
  [graficoId: string]: WBRData | {
    error: string;
    status: string;
    error_type?: string;
    details?: any;
  };
}

/**
 * Opções de filtros disponíveis
 */
export interface FilterOptions {
  datas: string[];
  shoppings: Array<{ value: string; label: string }>;
  ramos: string[];
  categorias: string[];
  lojas: string[];
}

/**
 * Filtros aplicados pelo usuário
 */
export interface UserFilters {
  data_referencia?: string;
  shopping?: string;
  ramo?: string;
  categoria?: string;
  loja?: string;
}

/**
 * Service para comunicação com endpoints WBR
 */
export const wbrApi = {
  /**
   * Busca dados de um único gráfico
   *
   * @param graficoId - Identificador único do gráfico
   * @param filters - Filtros aplicados pelo usuário (opcional)
   * @returns Promise com dados WBR
   * @throws Error se requisição falhar
   */
  async getGrafico(graficoId: string, filters?: UserFilters): Promise<WBRData> {
    const queryParams = new URLSearchParams();

    if (filters?.data_referencia) {
      queryParams.append('data_referencia', filters.data_referencia);
    }
    if (filters?.shopping) {
      queryParams.append('shopping', filters.shopping);
    }
    if (filters?.ramo) {
      queryParams.append('ramo', filters.ramo);
    }
    if (filters?.categoria) {
      queryParams.append('categoria', filters.categoria);
    }
    if (filters?.loja) {
      queryParams.append('loja', filters.loja);
    }

    const url = `${API_BASE_URL}/wbr/${graficoId}/?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar gráfico: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Busca todos os gráficos de uma página em paralelo
   * RECOMENDADO: Use este para carregar dashboards
   *
   * @param pageId - Identificador da página/dashboard
   * @param filters - Filtros aplicados pelo usuário (opcional)
   * @returns Promise com objeto {grafico_id: dados_wbr}
   * @throws Error se requisição falhar
   */
  async getPage(pageId: string, filters?: UserFilters): Promise<PageWBRData> {
    const queryParams = new URLSearchParams();

    if (filters?.data_referencia) {
      queryParams.append('data_referencia', filters.data_referencia);
    }
    if (filters?.shopping) {
      queryParams.append('shopping', filters.shopping);
    }
    if (filters?.ramo) {
      queryParams.append('ramo', filters.ramo);
    }
    if (filters?.categoria) {
      queryParams.append('categoria', filters.categoria);
    }
    if (filters?.loja) {
      queryParams.append('loja', filters.loja);
    }

    const url = `${API_BASE_URL}/wbr/page/${pageId}/?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar página: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Busca opções disponíveis para os filtros
   *
   * @returns Promise com opções de filtros
   * @throws Error se requisição falhar
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${API_BASE_URL}/wbr/filters/options/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar opções de filtros: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Busca opções filtradas baseadas em outros filtros já aplicados
   *
   * @param appliedFilters - Filtros já aplicados
   * @returns Promise com opções filtradas
   * @throws Error se requisição falhar
   */
  async getFilteredOptions(appliedFilters: Partial<UserFilters>): Promise<Partial<FilterOptions>> {
    const queryParams = new URLSearchParams();

    if (appliedFilters.shopping) {
      queryParams.append('shopping', appliedFilters.shopping);
    }
    if (appliedFilters.ramo) {
      queryParams.append('ramo', appliedFilters.ramo);
    }
    if (appliedFilters.categoria) {
      queryParams.append('categoria', appliedFilters.categoria);
    }

    const url = `${API_BASE_URL}/wbr/filters/filtered-options/?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar opções filtradas: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Busca datas disponíveis nos dados
   *
   * @returns Promise com array de datas disponíveis (formato YYYY-MM-DD)
   * @throws Error se requisição falhar
   */
  async getAvailableDates(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/wbr/filters/available-dates/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar datas disponíveis: ${response.statusText}`);
    }

    const data = await response.json();
    return data.dates || [];
  },
};

/**
 * Hook helper para verificar se dados WBR são válidos
 */
export function isWBRData(data: any): data is WBRData {
  return (
    data &&
    typeof data === 'object' &&
    'semanas_cy' in data &&
    'semanas_py' in data &&
    'meses_cy' in data &&
    'meses_py' in data &&
    'ano_atual' in data &&
    'ano_anterior' in data
  );
}

/**
 * Hook helper para verificar se é um erro
 */
export function isWBRError(data: any): data is { error: string; status: string } {
  return data && typeof data === 'object' && 'error' in data && 'status' in data;
}

/**
 * Interface para KPIs do Instagram
 */
export interface InstagramKPIs {
  seguidores: Array<{
    shopping: string;
    data?: string; // minúsculas (formato real do backend)
    DATA?: string; // maiúsculas (compatibilidade)
    metrica?: string; // minúsculas (formato real do backend)
    METRICA?: string; // maiúsculas (compatibilidade)
    value: any; // Pode ser número direto ou objeto JSON com dados demográficos
  }>;
  engagement: Array<{
    shopping: string;
    data: string;
    total_likes: number;
    total_alcance: number;
    total_impressoes: number;
    total_comentarios: number;
    total_compartilhamentos: number;
    total_salvos: number;
    engajamento_total: number;
    total_posts: number;
    engajamento_total_mes: number;
    engajamento_medio_dia: number;
    dias_disponiveis: number;
    alcance_total_mes: number;
    alcance_medio_dia: number;
  }>;
}

/**
 * Interface para Top Posts do Instagram
 */
export interface InstagramTopPost {
  shopping: string;
  data: string;
  link_foto: string;
  link_insta: string;
  total_likes: number;
  total_comentarios: number;
  total_compartilhamentos: number;
  total_salvos: number;
  engajamento_total: number;
}

/**
 * API do Instagram
 */
export const instagramApi = {
  /**
   * Busca KPIs do Instagram (seguidores, engajamento, alcance)
   *
   * @param filters - Filtros aplicados (data_referencia obrigatório, shopping opcional)
   * @returns Promise com KPIs do Instagram
   * @throws Error se requisição falhar
   */
  async getKPIs(filters: { data_referencia: string; shopping?: string }): Promise<InstagramKPIs> {
    const queryParams = new URLSearchParams();
    queryParams.append('data_referencia', filters.data_referencia);

    if (filters.shopping) {
      queryParams.append('shopping', filters.shopping);
    }

    const url = `${API_BASE_URL}/wbr/instagram/kpis/?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar KPIs do Instagram: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Busca Top Posts do Instagram ordenados por engajamento
   *
   * @param filters - Filtros aplicados (data_referencia e shopping opcionais, limit padrão 3)
   * @returns Promise com lista de top posts
   * @throws Error se requisição falhar
   */
  async getTopPosts(filters?: { data_referencia?: string; shopping?: string; limit?: number }): Promise<{ posts: InstagramTopPost[] }> {
    const queryParams = new URLSearchParams();

    if (filters?.data_referencia) {
      queryParams.append('data_referencia', filters.data_referencia);
    }
    if (filters?.shopping) {
      queryParams.append('shopping', filters.shopping);
    }
    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    const url = `${API_BASE_URL}/wbr/instagram/top-posts/?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ao buscar top posts do Instagram: ${response.statusText}`);
    }

    return response.json();
  },
};
