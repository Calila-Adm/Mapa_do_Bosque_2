/**
 * Componente WBRChart usando ECharts
 * Migrado da lógica Python/Plotly para TypeScript/React/ECharts
 */

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { WBRChartProps, KPIData } from '@/types/wbr.types';
import {
  formatarValor,
  calcularYoY,
  getYoYColor,
  gerarLabelsSemanas,
  calcularRangeSeguro,
  converterParaECharts,
} from '@/lib/chartUtils';
import { cn } from '@/lib/utils';

export function WBRChart({
  data,
  titulo,
  unidade,
  dataReferencia,
  isRGM = false,
}: WBRChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Inicializa instância do ECharts
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Prepara dados
    const valoresCYSemanas = converterParaECharts(data.semanas_cy.metric_value);
    const valoresPYSemanas = converterParaECharts(data.semanas_py.metric_value);
    const valoresCYMeses = converterParaECharts(data.meses_cy.metric_value);
    const valoresPYMeses = converterParaECharts(data.meses_py.metric_value);

    // Garante 12 meses
    while (valoresCYMeses.length < 12) valoresCYMeses.push(null);
    while (valoresPYMeses.length < 12) valoresPYMeses.push(null);

    // Calcula YoY
    const yoySemanas = valoresCYSemanas.map((cy, i) =>
      calcularYoY(cy, valoresPYSemanas[i])
    );
    const yoyMeses = valoresCYMeses.map((cy, i) => calcularYoY(cy, valoresPYMeses[i]));

    // Gera labels
    const labelsSemanas = gerarLabelsSemanas(data.semanas_cy.index);
    // Labels de meses sempre de JAN a DEZ (12 meses fixos)
    const labelsMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const labelsX = [...labelsSemanas, '', ...labelsMeses];

    // Prepara eixo X
    const semanasCount = valoresCYSemanas.length;
    const mesesOffset = semanasCount + 1;
    const xSemanas = Array.from({ length: semanasCount }, (_, i) => i);
    const xMeses = Array.from({ length: 12 }, (_, i) => i + mesesOffset);

    // Calcula ranges do eixo Y
    const rangeYSemanas = calcularRangeSeguro([
      ...valoresCYSemanas,
      ...valoresPYSemanas,
    ]);
    const rangeYMeses = calcularRangeSeguro([...valoresCYMeses, ...valoresPYMeses]);

    // Series para o gráfico
    const series: echarts.SeriesOption[] = [];

    // Adiciona linha PY Semanas
    if (!isRGM && valoresPYSemanas.length > 0) {
      series.push({
        name: `${data.ano_anterior}`,
        type: 'line',
        data: xSemanas.map((x, i) => [x, valoresPYSemanas[i]]),
        lineStyle: { color: '#D685AB', width: 1.5 },
        itemStyle: { color: '#D685AB' },
        symbol: 'none',
        yAxisIndex: 0,
      });
    }

    // Adiciona linha CY Semanas
    if (!isRGM && valoresCYSemanas.length > 0) {
      series.push({
        name: `${data.ano_atual}`,
        type: 'line',
        data: xSemanas.map((x, i) => [x, valoresCYSemanas[i]]),
        lineStyle: { color: '#000075', width: 2.5 },
        itemStyle: { color: '#00008B' },
        symbol: 'diamond',
        symbolSize: 8,
        smooth: true,
        yAxisIndex: 0,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            const valor = (params.value as number[])[1];
            return formatarValor(valor, 'numero');
          },
          fontSize: 15,
          color: 'black',
          offset: [-5, 0],
        },
        markPoint: {
          symbol: 'none',
          label: {
            show: true,
            formatter: (params: any) => {
              const idx = params.dataIndex;
              const yoy = yoySemanas[idx];
              if (yoy === null) return '';
              return formatarValor(yoy, 'percentual');
            },
            fontSize: 13,
            color: (params: any) => {
              const idx = params.dataIndex;
              const yoy = yoySemanas[idx];
              return getYoYColor(yoy);
            },
            offset: [0, -15],
          },
          data: xSemanas.map((x, i) => ({
            name: `semana-${i}`,
            coord: [x, valoresCYSemanas[i]],
            dataIndex: i,
          })),
        },
      });
    }

    // Adiciona linha PY Meses
    const indicesValidosPY = valoresPYMeses
      .map((v, i) => (v !== null ? i : -1))
      .filter((i) => i >= 0);
    if (indicesValidosPY.length > 0) {
      series.push({
        name: `${data.ano_anterior}`,
        type: 'line',
        data: indicesValidosPY.map((i) => [xMeses[i], valoresPYMeses[i]]),
        lineStyle: { color: '#D685AB', width: 1.5 },
        itemStyle: { color: '#D685AB' },
        symbol: 'none',
        yAxisIndex: 1,
        showSymbol: false,
      });
    }

    // Adiciona linha CY Meses
    const indicesValidosCY = valoresCYMeses
      .map((v, i) => (v !== null ? i : -1))
      .filter((i) => i >= 0);
    if (indicesValidosCY.length > 0) {
      // Verifica se o último mês é parcial
      const ultimoIndiceCY = indicesValidosCY[indicesValidosCY.length - 1];
      const ehMesParcial = data.mes_parcial_cy;

      series.push({
        name: `${data.ano_atual}`,
        type: 'line',
        data: indicesValidosCY.map((i) => [xMeses[i], valoresCYMeses[i]]),
        lineStyle: { color: '#00008B', width: 2.5 },
        itemStyle: { color: '#00008B' },
        symbol: 'diamond',
        symbolSize: 8,
        smooth: true,
        yAxisIndex: 1,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            const valor = (params.value as number[])[1];
            return formatarValor(valor, 'numero');
          },
          fontSize: 15,
          color: (params: any) => {
            // Se é o último ponto e é mês parcial, usa cinza
            const xValue = (params.value as number[])[0];
            const mesIndex = xValue - mesesOffset;
            if (ehMesParcial && mesIndex === ultimoIndiceCY) {
              return 'gray';
            }
            return 'black';
          },
          offset: [0, 0],
        },
        markPoint: {
          symbol: 'none',
          label: {
            show: true,
            formatter: (params: any) => {
              const value = params.value as number[];
              const mesIndex = value[0] - mesesOffset;
              const yoy = yoyMeses[mesIndex];
              if (yoy === null) return '';
              return formatarValor(yoy, 'percentual');
            },
            fontSize: 13,
            color: (params: any) => {
              const value = params.value as number[];
              const mesIndex = value[0] - mesesOffset;
              const yoy = yoyMeses[mesIndex];
              return getYoYColor(yoy);
            },
            offset: [0, -15],
          },
          data: indicesValidosCY.map((i) => ({
            name: `mes-${i}`,
            coord: [xMeses[i], valoresCYMeses[i]],
            value: [xMeses[i], valoresCYMeses[i]],
          })),
        },
      });
    }

    // Configuração do gráfico
    const option: echarts.EChartsOption = {
      title: {
        text: titulo,
        left: 'center',
        top: 30,
        textStyle: { fontSize: 20, color: 'black' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: series.map((s) => (s as { name?: string }).name || ''),
        bottom: 40,
        left: 'center',
      },
      grid: {
        top: 70,
        bottom: 100,
        left: 60,
        right: 60,
      },
      xAxis: {
        type: 'category',
        data: labelsX,
        axisLabel: { rotate: labelsX.length > 10 ? -45 : 0, fontSize: 11 },
        axisLine: { lineStyle: { color: '#6e6e6eff' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          nameTextStyle: { fontSize: 14 },
          min: rangeYSemanas[0],
          max: rangeYSemanas[1],
          axisLabel: { show: false },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
        {
          type: 'value',
          name: '',
          nameTextStyle: { fontSize: 14 },
          min: rangeYMeses[0],
          max: rangeYMeses[1],
          axisLabel: { show: false },
          splitLine: { show: false },
          position: 'right',
        },
      ],
      series,
    };

    // Adiciona linha separadora (REMOVIDO)
    option.graphic = [];

    // Se é RGM, adiciona overlay cinza na área semanal
    if (isRGM && chartRef.current) {
      option.graphic?.push({
        type: 'rect',
        z: 999,
        left: 60,
        top: 80,
        shape: {
          width: ((semanasCount / labelsX.length) * (chartRef.current.clientWidth - 120)),
          height: chartRef.current.clientHeight - 300,
        },
        style: {
          fill: 'rgba(202, 202, 202, 0.9)',
        },
      });

      option.graphic?.push({
        type: 'text',
        z: 1000,
        left: 'center',
        top: 'middle',
        style: {
          text: '⚠️ Não temos dados\nsemanais dessa métrica',
          fontSize: 18,
          fontWeight: 'bold',
          fill: 'white',
          align: 'center',
        },
      });
    }

    chartInstance.current.setOption(option);

    // Cleanup ao desmontar
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data, titulo, unidade, dataReferencia, isRGM]);

  // Renderiza KPIs
  const renderKPIs = () => {
    const kpis = calcularKPIs(
      converterParaECharts(data.semanas_cy.metric_value),
      converterParaECharts(data.semanas_py.metric_value),
      converterParaECharts(data.meses_cy.metric_value),
      converterParaECharts(data.meses_py.metric_value),
      dataReferencia
    );

    const kpiHeaders = [
      'LastWk',
      'WOW',
      'YOY(Semana)',
      'MTD',
      'YOY(Mês)',
      'QTD',
      'YOY(Trimestre)',
      'YTD',
      'YOY(Ano)',
    ];

    const kpiValues = isRGM
      ? [
          '-',
          '-',
          '-',
          formatarValor(kpis.mtd),
          formatarValor(kpis.yoyMes, 'percentual'),
          formatarValor(kpis.qtd),
          formatarValor(kpis.yoyTrimestre, 'percentual'),
          formatarValor(kpis.ytd),
          formatarValor(kpis.yoyAno, 'percentual'),
        ]
      : [
          formatarValor(kpis.lastWk),
          formatarValor(kpis.wow, 'percentual'),
          formatarValor(kpis.yoySemana, 'percentual'),
          formatarValor(kpis.mtd),
          formatarValor(kpis.yoyMes, 'percentual'),
          formatarValor(kpis.qtd),
          formatarValor(kpis.yoyTrimestre, 'percentual'),
          formatarValor(kpis.ytd),
          formatarValor(kpis.yoyAno, 'percentual'),
        ];

    return (
      <div className="flex justify-around -mt-5 p-3 bg-secondary rounded-lg">
        {kpiHeaders.map((header, i) => (
          <div key={i} className="text-center">
            <div className="text-sm font-bold mb-1.5">{header}</div>
            <div
              className={cn(
                'text-base',
                kpiValues[i] !== '-' &&
                  (header.includes('YOY') || header.includes('WOW'))
                  ? ''
                  : 'text-foreground'
              )}
              style={{
                color:
                  kpiValues[i] !== '-' &&
                  (header.includes('YOY') || header.includes('WOW'))
                    ? getYoYColor(
                        parseFloat(kpiValues[i].replace('%', '').replace('+', ''))
                      )
                    : undefined,
              }}
            >
              {kpiValues[i]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-0 flex justify-center">
      <div className="max-w-[1300px] w-full">
        <div ref={chartRef} className="w-full h-[500px]" />
        {renderKPIs()}
      </div>
    </div>
  );
}

/**
 * Calcula KPIs do gráfico WBR
 */
const calcularKPIs = (
  valoresCYSemanas: (number | null)[],
  valoresPYSemanas: (number | null)[],
  valoresCYMeses: (number | null)[],
  valoresPYMeses: (number | null)[],
  dataRef: Date
): KPIData => {
  // LastWk
  const lastWk = valoresCYSemanas[valoresCYSemanas.length - 1] || 0;

  // WOW (Week over Week)
  const semanaAnterior = valoresCYSemanas[valoresCYSemanas.length - 2] || 0;
  const wow = semanaAnterior !== 0 ? ((lastWk - semanaAnterior) / semanaAnterior) * 100 : 0;

  // YOY Semana
  const ultimaSemanaPY = valoresPYSemanas[valoresPYSemanas.length - 1] || 0;
  const yoySemana =
    ultimaSemanaPY !== 0 ? ((lastWk - ultimaSemanaPY) / ultimaSemanaPY) * 100 : 0;

  // MTD (Month to Date)
  const mesRef = dataRef.getMonth();
  const mtd = valoresCYMeses[mesRef] || 0;
  const mtdPY = valoresPYMeses[mesRef] || 0;
  const yoyMes = mtdPY !== 0 ? ((mtd - mtdPY) / mtdPY) * 100 : 0;

  // QTD (Quarter to Date)
  const trimestre = Math.floor(mesRef / 3);
  const inicioTrim = trimestre * 3;
  const fimTrim = Math.min(inicioTrim + 3, mesRef + 1);
  const qtd = valoresCYMeses
    .slice(inicioTrim, fimTrim)
    .reduce((acc, v) => (acc || 0) + (v || 0), 0) || 0;
  const qtdPY = valoresPYMeses
    .slice(inicioTrim, fimTrim)
    .reduce((acc, v) => (acc || 0) + (v || 0), 0) || 0;
  const yoyTrimestre = qtdPY !== 0 ? ((qtd - qtdPY) / qtdPY) * 100 : 0;

  // YTD (Year to Date)
  const ytd = valoresCYMeses.slice(0, mesRef + 1).reduce((acc, v) => (acc || 0) + (v || 0), 0) || 0;
  const ytdPY = valoresPYMeses.slice(0, mesRef + 1).reduce((acc, v) => (acc || 0) + (v || 0), 0) || 0;
  const yoyAno = ytdPY !== 0 ? ((ytd - ytdPY) / ytdPY) * 100 : 0;

  return {
    lastWk,
    wow,
    yoySemana,
    mtd,
    yoyMes,
    qtd,
    yoyTrimestre,
    ytd,
    yoyAno,
  };
};

export default WBRChart;
