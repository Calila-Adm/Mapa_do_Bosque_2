/**
 * Tipos TypeScript para dados do gráfico WBR
 * Migrado da lógica Python/Plotly para TypeScript/ECharts
 */

export interface MetricData {
  [key: string]: number | null;
}

export interface WeeklyData {
  metric_value: MetricData;
  index: Date[];
}

export interface MonthlyData {
  metric_value: MetricData;
  index: Date[];
}

export interface WBRData {
  semanas_cy: WeeklyData; // Current Year semanas
  semanas_py: WeeklyData; // Previous Year semanas
  meses_cy: MonthlyData; // Current Year meses
  meses_py: MonthlyData; // Previous Year meses
  ano_atual: number;
  ano_anterior: number;
  semana_parcial: boolean;
  mes_parcial_cy: boolean;
  mes_parcial_py: boolean;
}

export interface KPIData {
  lastWk: number;
  wow: number;
  yoySemana: number;
  mtd: number;
  yoyMes: number;
  qtd: number;
  yoyTrimestre: number;
  ytd: number;
  yoyAno: number;
}

export interface WBRChartProps {
  data: WBRData;
  titulo: string;
  unidade: string;
  dataReferencia: Date;
  isRGM?: boolean; // Se true, adiciona overlay na área semanal
}

export interface FormattedValue {
  value: string;
  color?: string;
}
