/**
 * Componente WBRChart usando ECharts
 * Migrado da lógica Python/Plotly para TypeScript/React/ECharts
 * OTIMIZADO: React.memo + useMemo para evitar re-renders desnecessários
 */

import { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';
import type { KPIData } from '@/types/wbr.types';
import type { WBRData } from '@/services/wbrApi';
import {
  formatarValor,
  calcularYoY,
  getYoYColor,
  gerarLabelsDDMM,
  calcularRangeSeguro,
  converterParaECharts,
} from '@/lib/chartUtils';
import { cn } from '@/lib/utils';

// Props ajustadas para aceitar WBRData da API
export interface WBRChartProps {
  data: WBRData;
  titulo: string;
  unidade: string;
  dataReferencia: Date;
  isRGM?: boolean;
}

// Função para comparar props e evitar re-renders desnecessários
const arePropsEqual = (prevProps: WBRChartProps, nextProps: WBRChartProps) => {
  // Compara propriedades simples primeiro
  if (
    prevProps.titulo !== nextProps.titulo ||
    prevProps.unidade !== nextProps.unidade ||
    prevProps.isRGM !== nextProps.isRGM ||
    prevProps.dataReferencia.getTime() !== nextProps.dataReferencia.getTime()
  ) {
    return false;
  }

  // Compara dados de forma mais profunda (verifica se o conteúdo mudou)
  // Compara anos
  if (
    prevProps.data.ano_atual !== nextProps.data.ano_atual ||
    prevProps.data.ano_anterior !== nextProps.data.ano_anterior
  ) {
    return false;
  }

  // Compara arrays de índices (datas)
  const prevIndexCY = JSON.stringify(prevProps.data.semanas_cy.index);
  const nextIndexCY = JSON.stringify(nextProps.data.semanas_cy.index);
  if (prevIndexCY !== nextIndexCY) {
    return false;
  }

  // Compara valores de métricas (semanas e meses)
  const prevValuesCY = JSON.stringify(prevProps.data.semanas_cy.metric_value);
  const nextValuesCY = JSON.stringify(nextProps.data.semanas_cy.metric_value);
  const prevValuesPY = JSON.stringify(prevProps.data.semanas_py.metric_value);
  const nextValuesPY = JSON.stringify(nextProps.data.semanas_py.metric_value);
  const prevMonthsCY = JSON.stringify(prevProps.data.meses_cy.metric_value);
  const nextMonthsCY = JSON.stringify(nextProps.data.meses_cy.metric_value);
  const prevMonthsPY = JSON.stringify(prevProps.data.meses_py.metric_value);
  const nextMonthsPY = JSON.stringify(nextProps.data.meses_py.metric_value);

  if (
    prevValuesCY !== nextValuesCY ||
    prevValuesPY !== nextValuesPY ||
    prevMonthsCY !== nextMonthsCY ||
    prevMonthsPY !== nextMonthsPY
  ) {
    return false;
  }

  // Se tudo é igual, pode reutilizar o render anterior
  return true;
};

const WBRChartComponent = ({
  data,
  titulo,
  unidade,
  dataReferencia,
  isRGM = false,
}: WBRChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    console.log('[WBRChart] useEffect chamado para:', titulo);

    if (!chartRef.current) {
      console.log('[WBRChart] chartRef.current não existe ainda');
      return;
    }

    // Validação básica dos dados
    if (!data || !data.semanas_cy || !data.semanas_py ||
        !data.meses_cy || !data.meses_py) {
      console.error('[WBRChart] Dados inválidos recebidos para:', titulo, data);
      return;
    }

    // Helper para determinar o tipo de formatação baseado na unidade
    const getTipoFormatacao = (): 'numero' | 'percentual' | 'percentual-yoy' => {
      return unidade === '%' ? 'percentual' : 'numero';
    };
    const tipoFormatacao = getTipoFormatacao();

    console.log('[WBRChart] Dados válidos recebidos para:', titulo, {
      semanas_cy_length: Object.keys(data.semanas_cy.metric_value || {}).length,
      meses_cy_length: Object.keys(data.meses_cy.metric_value || {}).length,
      unidade: unidade,
      tipoFormatacao: tipoFormatacao
    });

    // Inicializa instância do ECharts
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Prepara dados com validação
    let valoresCYSemanas = converterParaECharts(data.semanas_cy.metric_value || {});
    let valoresPYSemanas = converterParaECharts(data.semanas_py.metric_value || {});
    const valoresCYMeses = converterParaECharts(data.meses_cy.metric_value || {});
    const valoresPYMeses = converterParaECharts(data.meses_py.metric_value || {});

    // Para gráficos não-RGM, limitar a apenas 6 semanas
    if (!isRGM && valoresCYSemanas.length > 6) {
      valoresCYSemanas = valoresCYSemanas.slice(-6);
      valoresPYSemanas = valoresPYSemanas.slice(-6);
    }

    // Garante 12 meses
    while (valoresCYMeses.length < 12) valoresCYMeses.push(null);
    while (valoresPYMeses.length < 12) valoresPYMeses.push(null);

    // Calcula YoY
    const yoySemanas = valoresCYSemanas.map((cy, i) =>
      calcularYoY(cy, valoresPYSemanas[i])
    );
    const yoyMeses = valoresCYMeses.map((cy, i) => calcularYoY(cy, valoresPYMeses[i]));

    // Gera labels - converte strings para Date se necessário
    let datesArray = (data.semanas_cy.index || []).map(d =>
      typeof d === 'string' ? new Date(d) : d
    );

    // Para gráficos não-RGM, limitar a apenas 6 semanas
    if (!isRGM && datesArray.length > 6) {
      datesArray = datesArray.slice(-6);
    }

    // Usa formato DD/MM ao invés de "Wk XX" para semanas móveis
    const labelsSemanas = gerarLabelsDDMM(datesArray);
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
            return formatarValor(valor, tipoFormatacao);
          },
          fontSize: 15,
          color: 'black',
          offset: [-5, 0],
        },
        markPoint: {
          symbol: 'none',
          data: xSemanas
            .filter((_, i) => valoresCYSemanas[i] !== null)
            .map((x, i) => ({
              name: `semana-${i}`,
              coord: [x, valoresCYSemanas[i] || 0] as [number, number],
              label: {
                show: true,
                formatter: () => {
                  const yoy = yoySemanas[i];
                  if (yoy === null) return '';
                  return formatarValor(yoy, 'percentual-yoy');
                },
                fontSize: 13,
                color: getYoYColor(yoySemanas[i]),
                offset: [0, -15],
              },
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
      // Verifica se estamos no meio do mês (não é final do mês)
      const mesAtual = dataReferencia.getMonth(); // 0-11
      const ultimoDiaDoMes = new Date(
        dataReferencia.getFullYear(),
        mesAtual + 1,
        0
      ).getDate();
      const diaAtual = dataReferencia.getDate();
      const isEndOfMonth = diaAtual === ultimoDiaDoMes;

      // Se não é RGM e não está no final do mês, divide a linha em duas partes
      if (!isRGM && !isEndOfMonth && valoresCYMeses[mesAtual] !== null) {
        // Encontra o último mês válido antes do mês atual
        const indicesAntesMesAtual = indicesValidosCY.filter(i => i < mesAtual);
        const ultimoMesAnterior = indicesAntesMesAtual.length > 0
          ? indicesAntesMesAtual[indicesAntesMesAtual.length - 1]
          : null;

        // Parte 1: Meses anteriores ao mês atual (linha sólida)
        if (indicesAntesMesAtual.length > 0) {
          series.push({
            name: `${data.ano_atual}`,
            type: 'line',
            data: indicesAntesMesAtual.map((i) => [xMeses[i], valoresCYMeses[i]]),
            lineStyle: { color: '#00008B', width: 2.5, type: 'solid' },
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
                return formatarValor(valor, tipoFormatacao);
              },
              fontSize: 15,
              color: 'black',
              offset: [0, 0],
            },
            markPoint: {
              symbol: 'none',
              data: indicesAntesMesAtual
                .filter(i => valoresCYMeses[i] !== null)
                .map((i) => ({
                  name: `mes-${i}`,
                  coord: [xMeses[i], valoresCYMeses[i] || 0] as [number, number],
                  label: {
                    show: true,
                    formatter: () => {
                      const yoy = yoyMeses[i];
                      if (yoy === null) return '';
                      return formatarValor(yoy, 'percentual-yoy');
                    },
                    fontSize: 13,
                    color: getYoYColor(yoyMeses[i]),
                    offset: [0, -15],
                  },
                })),
            },
          });
        }

        // Parte 2: Linha pontilhada do último mês anterior até o mês atual
        // Precisa de 2 pontos para desenhar a linha
        if (ultimoMesAnterior !== null) {
          series.push({
            name: `${data.ano_atual}`,
            type: 'line',
            data: [
              [xMeses[ultimoMesAnterior], valoresCYMeses[ultimoMesAnterior]],
              [xMeses[mesAtual], valoresCYMeses[mesAtual]]
            ],
            lineStyle: { color: '#00008B', width: 2.5, type: 'dashed' },
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
                return formatarValor(valor, tipoFormatacao);
              },
              fontSize: 15,
              color: 'black',
              offset: [0, 0],
            },
            markPoint: {
              symbol: 'none',
              data: [{
                name: `mes-${mesAtual}`,
                coord: [xMeses[mesAtual], valoresCYMeses[mesAtual] || 0] as [number, number],
                label: {
                  show: true,
                  formatter: () => {
                    const yoy = yoyMeses[mesAtual];
                    if (yoy === null) return '';
                    return formatarValor(yoy, 'percentual-yoy');
                  },
                  fontSize: 13,
                  color: getYoYColor(yoyMeses[mesAtual]),
                  offset: [0, -15],
                },
              }],
            },
          });
        } else {
          // Se não há mês anterior (janeiro), apenas renderiza o ponto
          series.push({
            name: `${data.ano_atual}`,
            type: 'line',
            data: [[xMeses[mesAtual], valoresCYMeses[mesAtual]]],
            lineStyle: { color: '#00008B', width: 2.5, type: 'dashed' },
            itemStyle: { color: '#00008B' },
            symbol: 'diamond',
            symbolSize: 8,
            smooth: false,
            yAxisIndex: 1,
            showSymbol: true,
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const valor = (params.value as number[])[1];
                return formatarValor(valor, tipoFormatacao);
              },
              fontSize: 15,
              color: 'black',
              offset: [0, 0],
            },
            markPoint: {
              symbol: 'none',
              data: [{
                name: `mes-${mesAtual}`,
                coord: [xMeses[mesAtual], valoresCYMeses[mesAtual] || 0] as [number, number],
                label: {
                  show: true,
                  formatter: () => {
                    const yoy = yoyMeses[mesAtual];
                    if (yoy === null) return '';
                    return formatarValor(yoy, 'percentual-yoy');
                  },
                  fontSize: 13,
                  color: getYoYColor(yoyMeses[mesAtual]),
                  offset: [0, -15],
                },
              }],
            },
          });
        }
      } else {
        // Caso padrão: linha inteira sólida (RGM ou final do mês)
        series.push({
          name: `${data.ano_atual}`,
          type: 'line',
          data: indicesValidosCY.map((i) => [xMeses[i], valoresCYMeses[i]]),
          lineStyle: { color: '#00008B', width: 2.5, type: 'solid' },
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
              return formatarValor(valor, tipoFormatacao);
            },
            fontSize: 15,
            color: 'black',
            offset: [0, 0],
          },
          markPoint: {
            symbol: 'none',
            data: indicesValidosCY
              .filter(i => valoresCYMeses[i] !== null)
              .map((i) => ({
                name: `mes-${i}`,
                coord: [xMeses[i], valoresCYMeses[i] || 0] as [number, number],
                label: {
                  show: true,
                  formatter: () => {
                    const yoy = yoyMeses[i];
                    if (yoy === null) return '';
                    return formatarValor(yoy, 'percentual-yoy');
                  },
                  fontSize: 13,
                  color: getYoYColor(yoyMeses[i]),
                  offset: [0, -15],
                },
              })),
          },
        });
      }
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
        valueFormatter: (value: any) => {
          const numValue = typeof value === 'number' ? value : Number(value);
          return formatarValor(numValue, tipoFormatacao);
        },
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
          name: unidade || '',
          nameTextStyle: { fontSize: 14 },
          min: rangeYSemanas[0],
          max: rangeYSemanas[1],
          axisLabel: {
            show: !isRGM, // Se for RGM, não mostra o eixo Y semanal
            formatter: (value: number) => formatarValor(value, tipoFormatacao)
          },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
        {
          type: 'value',
          name: unidade || '',
          nameTextStyle: { fontSize: 14 },
          min: rangeYMeses[0],
          max: rangeYMeses[1],
          axisLabel: {
            show: true, // Sempre mostra o eixo Y mensal
            formatter: (value: number) => formatarValor(value, tipoFormatacao)
          },
          splitLine: { show: false },
          position: 'right',
        },
      ],
      series,
    };

    // Adiciona linha separadora entre visão semana e mês
    option.graphic = [];

    // Linha vertical entre semanas e meses
    const separatorX = semanasCount + 0.5;
    if (chartRef.current) {
      const chartWidth = chartRef.current.clientWidth;
      const chartHeight = chartRef.current.clientHeight;
      const gridLeft = 60;
      const gridRight = 60;
      const gridTop = 70;
      const gridBottom = 100;

      // Calcula posição X da linha (proporcionalmente)
      const totalDataPoints = labelsX.length;
      const lineXPosition = gridLeft + ((separatorX / totalDataPoints) * (chartWidth - gridLeft - gridRight));

      option.graphic.push({
        type: 'line',
        z: 998,
        shape: {
          x1: lineXPosition,
          y1: gridTop,
          x2: lineXPosition,
          y2: chartHeight - gridBottom,
        },
        style: {
          stroke: '#88888888',
          lineWidth: 1,
          lineDash: [5, 5],
        },
      });
    }

    // Se é RGM, adiciona overlay cinza na área semanal
    if (isRGM && chartRef.current) {
      option.graphic?.push({
        type: 'rect',
        z: 999,
        left: 60,
        top: 80,
        shape: {
          width: ((semanasCount / labelsX.length) * (chartRef.current.clientWidth - 120)),
          height: chartRef.current.clientHeight - 188,
        },
        style: {
          fill: 'rgba(202, 202, 202, 0.9)',
        },
      });
    }

    chartInstance.current.setOption(option, {
      notMerge: true,   // Recria o gráfico completamente quando dados mudam (importante para filtros)
      lazyUpdate: false, // Atualiza imediatamente
    });

    // Cleanup ao desmontar
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data, titulo, unidade, isRGM]); // Removido dataReferencia - não é necessário

  // Renderiza KPIs
  const renderKPIs = () => {
    if (!data || !data.semanas_cy || !data.semanas_py ||
        !data.meses_cy || !data.meses_py) {
      return null;
    }

    const kpis = calcularKPIs(
      converterParaECharts(data.semanas_cy.metric_value || {}),
      converterParaECharts(data.semanas_py.metric_value || {}),
      converterParaECharts(data.meses_cy.metric_value || {}),
      converterParaECharts(data.meses_py.metric_value || {}),
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

// Exporta componente memoizado para evitar re-renders desnecessários
export const WBRChart = memo(WBRChartComponent, arePropsEqual);

export default WBRChart;
