/**
 * Funções utilitárias para gráficos WBR
 * Migrado da lógica Python (charts.py e wbr_charts_modular.py)
 */

/**
 * Formata valores numéricos para exibição
 * Equivalente à função formatar_valor() do Python
 */
export const formatarValor = (
  valor: number | null | undefined,
  tipo: 'numero' | 'percentual' = 'numero'
): string => {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '';
  }

  if (tipo === 'numero') {
    if (valor >= 1_000_000_000) {
      return `${(valor / 1_000_000_000).toFixed(1)}B`;
    } else if (valor >= 1_000_000) {
      return `${(valor / 1_000_000).toFixed(1)}M`;
    } else if (valor >= 1_000) {
      return `${(valor / 1_000).toFixed(1)}k`;
    } else {
      return valor.toFixed(0);
    }
  } else if (tipo === 'percentual') {
    return `${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`;
  }

  return String(valor);
};

/**
 * Calcula variação Year-over-Year (YoY)
 * Equivalente à função calcular_yoy() do Python
 */
export const calcularYoY = (
  valorCY: number | null | undefined,
  valorPY: number | null | undefined
): number | null => {
  if (
    valorCY === null ||
    valorCY === undefined ||
    valorPY === null ||
    valorPY === undefined ||
    isNaN(valorCY) ||
    isNaN(valorPY) ||
    valorPY === 0
  ) {
    return null;
  }

  return ((valorCY - valorPY) / valorPY) * 100;
};

/**
 * Obtém cor para valores YoY
 */
export const getYoYColor = (yoy: number | null): string => {
  if (yoy === null) return 'black';
  if (yoy > 0) return 'darkgreen';
  if (yoy < 0) return 'darkred';
  return 'black';
};

/**
 * Gera labels de semanas (Wk 1, Wk 2, etc.)
 */
export const gerarLabelsSemanas = (datas: Date[]): string[] => {
  return datas.map((data) => {
    // Cálculo de semana ISO 8601
    const d = new Date(data);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `Wk ${weekNo}`;
  });
};

/**
 * Gera labels de meses (JAN, FEV, etc.)
 */
export const gerarLabelsMeses = (datas: Date[]): string[] => {
  const mesesMap: { [key: number]: string } = {
    0: 'JAN',
    1: 'FEV',
    2: 'MAR',
    3: 'ABR',
    4: 'MAI',
    5: 'JUN',
    6: 'JUL',
    7: 'AGO',
    8: 'SET',
    9: 'OUT',
    10: 'NOV',
    11: 'DEZ',
  };

  return datas.map((data) => mesesMap[data.getMonth()]);
};

/**
 * Calcula faixa segura para eixo Y
 */
export const calcularRangeSeguro = (valores: (number | null)[]): [number, number] => {
  const valoresValidos = valores.filter((v) => v !== null && !isNaN(v)) as number[];

  if (valoresValidos.length === 0) {
    return [0, 1];
  }

  const min = Math.min(...valoresValidos);
  const max = Math.max(...valoresValidos);

  if (min === max) {
    return [0, max * 1.2 || 1];
  }

  return [min * 0.85, max * 1.15];
};

/**
 * Converte array de valores para formato ECharts
 */
export const converterParaECharts = (
  valores: { [key: string]: number | null }
): (number | null)[] => {
  return Object.values(valores);
};
