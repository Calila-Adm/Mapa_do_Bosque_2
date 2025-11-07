"""
WBRService - Orquestrador principal que coordena toda a geração de dados WBR
"""

from datetime import date, datetime
from typing import Dict, Any
import os
import random

from wbr.services.config_loader import ConfigLoader
from wbr.services.query_builder import QueryBuilder
from wbr.services.instagram_query_builder import InstagramQueryBuilder
from wbr.services.rgm_cto_percentual_query_builder import RgmCtoPercentualQueryBuilder
from wbr.database.interface import DatabaseInterface
from wbr.services.data_processor import DataProcessor
from wbr.cache.interface import CacheInterface
from wbr.cache.null_cache import NullCache
from wbr.services.logger import StructuredLogger, NullLogger
from wbr.exceptions import WBRException


class WBRService:
    """
    Serviço principal que orquestra geração de dados WBR.

    Fluxo completo:
    1. Verifica cache
    2. Carrega e valida configuração
    3. Valida colunas no banco
    4. Calcula períodos (CY e PY)
    5. Monta e executa queries
    6. Transforma dados para formato WBR
    7. Salva no cache
    8. Retorna resultado
    """

    def __init__(
        self,
        config_loader: ConfigLoader,
        query_builder: QueryBuilder,
        db_executor: DatabaseInterface,
        data_processor: DataProcessor,
        cache: CacheInterface = None,
        logger: StructuredLogger = None
    ):
        """
        Inicializa WBRService com dependências injetadas.

        Args:
            config_loader: Carregador de configurações
            query_builder: Construtor de queries
            db_executor: Executor de banco de dados
            data_processor: Processador de dados
            cache: Sistema de cache (opcional)
            logger: Logger estruturado (opcional)
        """
        self.config_loader = config_loader
        self.query_builder = query_builder
        self.db_executor = db_executor
        self.data_processor = data_processor
        self.cache = cache or NullCache()
        self.logger = logger or NullLogger()

    def generate(
        self,
        grafico_id: str,
        user_filters: Dict[str, Any] = None,
        data_referencia: str = None
    ) -> Dict[str, Any]:
        """
        Gera dados WBR completos para um gráfico.

        Args:
            grafico_id: Identificador único do gráfico
            user_filters: Filtros aplicados pelo usuário (opcional)
            data_referencia: Data de referência para cálculo do período (opcional, default: hoje)

        Returns:
            Dicionário com dados WBR no formato esperado:
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

        Raises:
            ConfigNotFoundException: Se configuração não for encontrada
            InvalidConfigException: Se configuração for inválida
            InvalidColumnException: Se colunas não existirem
            QueryExecutionException: Se houver erro na execução
            DataTransformationException: Se houver erro na transformação
        """
        start_time = datetime.now()

        # Define data de referência (usa hoje se não informada)
        if data_referencia is None:
            data_referencia = date.today().isoformat()

        # 1. Verifica cache (chave única por gráfico + data + filtros)
        # Inclui hash dos filtros para diferenciar requests com filtros diferentes
        import hashlib
        import json
        filters_hash = hashlib.md5(json.dumps(user_filters or {}, sort_keys=True).encode()).hexdigest()[:8]
        cache_key = f"wbr:{grafico_id}:{data_referencia}:{filters_hash}"
        cached = self.cache.get(cache_key)

        if cached:
            return cached

        try:
            # 2. Carrega e valida configuração
            config = self.config_loader.load(grafico_id)
            self.config_loader.validate(config)

            # Validação de colunas (apenas para gráficos padrão)
            # Pula validação para templates customizados (Instagram, CTO Percentual, etc)
            if not config.get('use_instagram_template', False) and not config.get('use_cto_percentual_template', False):
                # 3. Valida se colunas existem no banco (apenas para gráficos padrão)
                colunas_necessarias = [
                    config['colunas']['data'],
                    config['colunas']['valor']
                ]
                self.db_executor.validate_columns(config['tabela'], colunas_necessarias)

            # 4. Calcula períodos baseado na data de referência
            cy_inicio, cy_fim, py_inicio, py_fim = self._calculate_periods(data_referencia)

            # 5. Monta queries com filtros do usuário
            # Detecta qual QueryBuilder usar baseado no tipo de gráfico
            if config.get('use_instagram_template', False):
                # Gráficos do Instagram
                instagram_builder = InstagramQueryBuilder()
                query_cy = instagram_builder.build(config, cy_inicio, cy_fim, user_filters)
                query_py = instagram_builder.build(config, py_inicio, py_fim, user_filters)
            elif config.get('use_cto_percentual_template', False):
                # Gráfico de CTO Percentual (RGM)
                cto_percentual_builder = RgmCtoPercentualQueryBuilder()
                query_cy = cto_percentual_builder.build(config, cy_inicio, cy_fim, user_filters)
                query_py = cto_percentual_builder.build(config, py_inicio, py_fim, user_filters)
            else:
                # Gráficos padrão
                query_cy = self.query_builder.build(config, cy_inicio, cy_fim, user_filters)
                query_py = self.query_builder.build(config, py_inicio, py_fim, user_filters)

            # 6. Executa queries
            dados_cy = self.db_executor.execute(query_cy, {
                'data_inicio': cy_inicio,
                'data_fim': cy_fim
            })

            dados_py = self.db_executor.execute(query_py, {
                'data_inicio': py_inicio,
                'data_fim': py_fim
            })

            # 7. Transforma dados para formato WBR
            ano_atual = date.today().year
            ano_anterior = ano_atual - 1

            # Define agrupamento
            usar_instagram = config.get('use_instagram_template', False)
            agrupamento = 'semanal' if usar_instagram else config['agrupamento']

            # Converte data_referencia string para objeto date
            data_ref_obj = datetime.strptime(data_referencia, '%Y-%m-%d').date()

            # TODOS os gráficos agora usam semanas móveis
            resultado = self.data_processor.transform_to_wbr(
                dados_cy=dados_cy,
                dados_py=dados_py,
                agrupamento=agrupamento,
                ano_atual=ano_atual,
                ano_anterior=ano_anterior,
                data_referencia=data_ref_obj,
                usar_semana_movel=True  # Sempre True para todos os gráficos
            )

            # Adiciona metadados do gráfico na resposta
            resultado['titulo'] = config.get('titulo', grafico_id)
            resultado['unidade'] = config.get('unidade', '')
            resultado['is_rgm'] = config.get('is_rgm', False)

            # 8. Salva no cache (TTL: 1 hora = 3600 segundos)
            self.cache.set(cache_key, resultado, ttl=3600)

            return resultado

        except WBRException:
            # Re-raise exceções WBR (já são tratadas)
            raise
        except Exception as e:
            # Captura qualquer outra exceção
            raise

    def _calculate_periods(self, data_referencia: str) -> tuple:
        """
        Calcula data_inicio e data_fim para CY (Current Year) e PY (Previous Year).

        Baseado na data de referência:
        - Se data_referencia = "2025-08-20"
          -> CY: 2025-01-01 até 2025-08-20
          -> PY: 2024-01-01 até 2024-08-20

        Args:
            data_referencia: Data de referência no formato YYYY-MM-DD

        Returns:
            Tupla (cy_inicio, cy_fim, py_inicio, py_fim) com strings no formato YYYY-MM-DD
        """
        # Converte string para date
        ref_date = datetime.strptime(data_referencia, '%Y-%m-%d').date()
        ano_atual = ref_date.year
        ano_anterior = ano_atual - 1

        # Current Year: 01/jan até data de referência
        cy_inicio = f"{ano_atual}-01-01"
        cy_fim = data_referencia

        # Previous Year: 01/jan até mesmo dia do ano passado
        py_inicio = f"{ano_anterior}-01-01"

        # Trata caso especial de 29/02 (ano bissexto)
        try:
            py_fim = date(ano_anterior, ref_date.month, ref_date.day).isoformat()
        except ValueError:
            # Se dia não existe no ano anterior (ex: 29/02), usa último dia do mês
            import calendar
            ultimo_dia = calendar.monthrange(ano_anterior, ref_date.month)[1]
            py_fim = date(ano_anterior, ref_date.month, ultimo_dia).isoformat()

        return (cy_inicio, cy_fim, py_inicio, py_fim)
