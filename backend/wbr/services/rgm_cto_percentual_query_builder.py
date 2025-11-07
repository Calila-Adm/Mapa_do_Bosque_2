"""
RgmCtoPercentualQueryBuilder - Constrói queries SQL para CTO Percentual
Herda do QueryBuilder mas usa template específico para CTO Percentual com JOIN
"""

from pathlib import Path
from typing import Dict, Any, Optional
from wbr.services.query_builder import QueryBuilder


class RgmCtoPercentualQueryBuilder(QueryBuilder):
    """
    QueryBuilder especializado para CTO Percentual (RGM).

    Diferenças do QueryBuilder padrão:
    - Usa template SQL com JOIN entre Rgm_cto e Rgm_valor_bruto
    - Calcula CTO como percentual da Venda Bruta
    - Agrupa por data e aplica filtros na coluna 'chave'
    """

    def __init__(self):
        """Inicializa com template do CTO Percentual"""
        # Caminho para o template do CTO Percentual
        module_dir = Path(__file__).parent.parent
        template_path = module_dir / 'sql' / 'rgm' / 'cto_percentual_template.sql'
        super().__init__(template_path=str(template_path))

    def build(
        self,
        config: Dict[str, Any],
        data_inicio: str,
        data_fim: str,
        user_filters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Constrói query SQL para CTO Percentual substituindo placeholders.

        Placeholders específicos:
          {filtros_dinamicos} -> resultado de build_filters()

        Args:
            config: Dicionário de configuração do gráfico
            data_inicio: Data inicial (formato: YYYY-MM-DD)
            data_fim: Data final (formato: YYYY-MM-DD)
            user_filters: Filtros aplicados pelo usuário (opcional)

        Returns:
            Query SQL completa e pronta para execução
        """
        query = self.template

        # Combina filtros de configuração + filtros do usuário
        combined_filters = {**config.get('filtros', {})}
        if user_filters:
            combined_filters.update(user_filters)

        # Constrói filtros dinâmicos
        # Para CTO Percentual, os filtros são aplicados no WHERE do CTE
        filtros_sql = self.build_filters(combined_filters)

        # Se não houver filtros, substitui por string vazia
        if not filtros_sql:
            filtros_sql = ''
        else:
            # Adiciona prefixo CTO. nas referências de coluna "chave" para evitar ambiguidade
            # A coluna "chave" existe tanto em CTO quanto em VB
            filtros_sql = filtros_sql.replace(' chave ', ' CTO.chave ')
            filtros_sql = filtros_sql.replace('AND chave', 'AND CTO.chave')

        query = query.replace('{filtros_dinamicos}', filtros_sql)

        return query
