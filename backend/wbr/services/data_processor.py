"""
DataProcessor - Transforma dados brutos em formato WBR completo
Agrupa por semana/mês, converte datas para ISO 8601, calcula flags parciais
"""

from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from collections import defaultdict

from wbr.exceptions import DataTransformationException


class DataProcessor:
    """Processa e transforma dados brutos para formato WBR"""

    def transform_to_wbr(
        self,
        dados_cy: List[Dict[str, Any]],
        dados_py: List[Dict[str, Any]],
        agrupamento: str,
        ano_atual: int,
        ano_anterior: int,
        data_referencia: date = None,
        usar_semana_movel: bool = False
    ) -> Dict[str, Any]:
        """
        Transforma dados brutos em formato WBR completo.

        Formato de saída:
        {
          "semanas_cy": {"metric_value": {...}, "index": [...]},
          "semanas_py": {"metric_value": {...}, "index": [...]},
          "meses_cy": {"metric_value": {...}, "index": [...]},
          "meses_py": {"metric_value": {...}, "index": [...]},
          "ano_atual": 2025,
          "ano_anterior": 2024,
          "semana_parcial": false,
          "mes_parcial_cy": true,
          "mes_parcial_py": false
        }

        Args:
            dados_cy: Dados do ano atual (lista de {data, valor})
            dados_py: Dados do ano anterior (lista de {data, valor})
            agrupamento: "semanal" ou "mensal"
            ano_atual: Ano atual (ex: 2025)
            ano_anterior: Ano anterior (ex: 2024)
            data_referencia: Data de referência para semanas móveis
            usar_semana_movel: Se True, usa semanas móveis ao invés de fixas

        Returns:
            Dicionário no formato WBR

        Raises:
            DataTransformationException: Se houver erro na transformação
        """
        try:
            # Agrupa dados por semana
            if usar_semana_movel and data_referencia:
                semanas_cy = self.group_by_rolling_week(dados_cy, data_referencia)

                # Calcula data do ano anterior (trata ano bissexto)
                try:
                    data_ref_py = date(data_referencia.year - 1, data_referencia.month, data_referencia.day)
                except ValueError:
                    # 29 de fevereiro em ano não bissexto -> usa 28 de fevereiro
                    data_ref_py = date(data_referencia.year - 1, data_referencia.month, 28)

                semanas_py = self.group_by_rolling_week(dados_py, data_ref_py)
            else:
                semanas_cy = self.group_by_week(dados_cy)
                semanas_py = self.group_by_week(dados_py)

            # Agrupa dados por mês
            meses_cy = self.group_by_month(dados_cy)
            meses_py = self.group_by_month(dados_py)

            # Calcula flags parciais
            flags = self.calculate_partial_flags(dados_cy, dados_py)

            # Monta estrutura final
            result = {
                "semanas_cy": self._format_metric_data(semanas_cy),
                "semanas_py": self._format_metric_data(semanas_py),
                "meses_cy": self._format_metric_data(meses_cy),
                "meses_py": self._format_metric_data(meses_py),
                "ano_atual": ano_atual,
                "ano_anterior": ano_anterior,
                **flags
            }

            return result

        except Exception as e:
            raise DataTransformationException(
                message=f"Erro ao transformar dados: {str(e)}",
                data_sample={'cy_count': len(dados_cy), 'py_count': len(dados_py)}
            )

    def group_by_week(self, dados: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Agrupa dados por semana (domingo como início).

        Args:
            dados: Lista de {data, valor}

        Returns:
            Dicionário {data_inicio_semana_iso: valor_agregado}
        """
        weekly_data = defaultdict(float)

        for row in dados:
            # Converte data para objeto date
            data_obj = self._parse_date(row['data'])

            # Encontra domingo da semana (início da semana)
            days_since_sunday = (data_obj.weekday() + 1) % 7
            week_start = data_obj - timedelta(days=days_since_sunday)

            # Converte para ISO 8601 UTC
            week_start_iso = self._to_iso8601(week_start)

            # Soma valores da mesma semana
            weekly_data[week_start_iso] += float(row['valor'])

        return dict(weekly_data)

    def group_by_rolling_week(self, dados: List[Dict[str, Any]], data_referencia: date) -> Dict[str, float]:
        """
        Agrupa dados por semanas móveis de 7 dias.
        A data de referência é o último dia da semana mais recente.
        Cada semana é formada por 7 dias consecutivos retroativos.

        Exemplo:
        - Data de referência: 30/10/2025
        - Semana 1: 24/10 a 30/10 (label: "30/10" - último dia)
        - Semana 2: 17/10 a 23/10 (label: "23/10" - último dia)
        - Semana 3: 10/10 a 16/10 (label: "16/10" - último dia)

        Args:
            dados: Lista de {data, valor}
            data_referencia: Data que será o último dia da semana mais recente

        Returns:
            Dicionário {data_fim_semana_iso: valor_agregado}
        """
        weekly_data = defaultdict(float)

        # Garante que data_referencia seja date (não datetime)
        if isinstance(data_referencia, datetime):
            data_referencia = data_referencia.date()

        # Para cada registro de dados
        for row in dados:
            data_obj = self._parse_date(row['data'])

            # Calcula quantos dias essa data está antes da data de referência
            dias_antes = (data_referencia - data_obj).days

            if dias_antes < 0:
                # Data está no futuro, ignora
                continue

            # Determina em qual semana móvel essa data cai
            # Semana 0: últimos 7 dias (0-6 dias antes)
            # Semana 1: 7-13 dias antes
            # Semana 2: 14-20 dias antes, etc.
            semana_index = dias_antes // 7

            # Calcula o FIM dessa semana móvel (último dia)
            # Fim da semana = data_referencia - (semana_index * 7)
            dias_ate_fim = semana_index * 7
            week_end = data_referencia - timedelta(days=dias_ate_fim)

            # Converte para ISO 8601 UTC
            week_end_iso = self._to_iso8601(week_end)

            # Soma valores da mesma semana
            weekly_data[week_end_iso] += float(row['valor'])

        return dict(weekly_data)

    def group_by_month(self, dados: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Agrupa dados por mês (primeiro dia do mês).

        Args:
            dados: Lista de {data, valor}

        Returns:
            Dicionário {primeiro_dia_mes_iso: valor_agregado}
        """
        monthly_data = defaultdict(float)

        for row in dados:
            # Converte data para objeto date
            data_obj = self._parse_date(row['data'])

            # Primeiro dia do mês
            month_start = date(data_obj.year, data_obj.month, 1)

            # Converte para ISO 8601 UTC
            month_start_iso = self._to_iso8601(month_start)

            # Soma valores do mesmo mês
            monthly_data[month_start_iso] += float(row['valor'])

        return dict(monthly_data)

    def calculate_partial_flags(
        self,
        dados_cy: List[Dict[str, Any]],
        dados_py: List[Dict[str, Any]]
    ) -> Dict[str, bool]:
        """
        Calcula flags de períodos parciais.

        Returns:
            {
              "semana_parcial": bool,  # Semana atual ainda não terminou
              "mes_parcial_cy": bool,  # Mês atual ainda não terminou
              "mes_parcial_py": bool   # Mês correspondente no ano passado não terminou
            }
        """
        hoje = date.today()

        # Semana parcial: se hoje não é sábado
        semana_parcial = hoje.weekday() != 5  # 5 = sábado

        # Mês parcial CY: se hoje não é último dia do mês
        ultimo_dia_mes = self._get_last_day_of_month(hoje)
        mes_parcial_cy = hoje != ultimo_dia_mes

        # Mês parcial PY: mesmo mês/dia no ano anterior
        try:
            data_correspondente_py = date(hoje.year - 1, hoje.month, hoje.day)
            ultimo_dia_mes_py = self._get_last_day_of_month(data_correspondente_py)
            mes_parcial_py = data_correspondente_py != ultimo_dia_mes_py
        except ValueError:
            # Se dia não existe no ano anterior (ex: 29/02), considera parcial
            mes_parcial_py = True

        return {
            "semana_parcial": semana_parcial,
            "mes_parcial_cy": mes_parcial_cy,
            "mes_parcial_py": mes_parcial_py
        }

    def _format_metric_data(self, data: Dict[str, float]) -> Dict[str, Any]:
        """
        Formata dados no formato esperado pelo frontend.

        Args:
            data: Dicionário {timestamp_iso: valor}

        Returns:
            {"metric_value": {...}, "index": [...]}
        """
        # Ordena por data
        sorted_items = sorted(data.items(), key=lambda x: x[0])

        return {
            "metric_value": dict(sorted_items),
            "index": [timestamp for timestamp, _ in sorted_items]
        }

    def _parse_date(self, data: Any) -> date:
        """
        Converte vários formatos de data para objeto date.

        Args:
            data: String, datetime ou date

        Returns:
            Objeto date
        """
        # Verifica datetime ANTES de date, pois datetime é subclasse de date
        if isinstance(data, datetime):
            return data.date()
        elif isinstance(data, date):
            return data
        elif isinstance(data, str):
            # Tenta vários formatos
            formats = [
                '%Y-%m-%d',
                '%Y/%m/%d',
                '%d/%m/%Y',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%dT%H:%M:%S.%f',
            ]

            for fmt in formats:
                try:
                    return datetime.strptime(data, fmt).date()
                except ValueError:
                    continue

            raise ValueError(f"Formato de data não reconhecido: {data}")
        else:
            raise ValueError(f"Tipo de data não suportado: {type(data)}")

    def _to_iso8601(self, data_obj: date) -> str:
        """
        Converte date para ISO 8601 UTC.

        Args:
            data_obj: Objeto date

        Returns:
            String no formato "YYYY-MM-DDTHH:MM:SS.000Z"
        """
        # Converte para datetime com hora 00:00:00 UTC
        dt = datetime.combine(data_obj, datetime.min.time())
        return dt.isoformat() + '.000Z'

    def _get_last_day_of_month(self, data: date) -> date:
        """
        Retorna último dia do mês de uma data.

        Args:
            data: Objeto date

        Returns:
            Último dia do mês
        """
        # Vai para o primeiro dia do próximo mês e subtrai 1 dia
        if data.month == 12:
            next_month = date(data.year + 1, 1, 1)
        else:
            next_month = date(data.year, data.month + 1, 1)

        return next_month - timedelta(days=1)
