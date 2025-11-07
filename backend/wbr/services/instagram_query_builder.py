"""
InstagramQueryBuilder - Constrói queries SQL para dados do Instagram
Herda do QueryBuilder mas usa template específico para Instagram
"""

from pathlib import Path
from typing import Dict, Any, Optional
from wbr.services.query_builder import QueryBuilder


class InstagramQueryBuilder(QueryBuilder):
    """
    QueryBuilder especializado para dados do Instagram.

    Diferenças do QueryBuilder padrão:
    - Usa template SQL com UNION de múltiplos schemas (SCIB, SBGP, SBI)
    - Agrupa dados por shopping antes de aplicar filtros
    - Não precisa de campos 'tabela' e 'colunas' no config
    """

    def __init__(self):
        """Inicializa com template do Instagram"""
        # Caminho para o template do Instagram
        module_dir = Path(__file__).parent.parent
        template_path = module_dir / 'sql' / 'instagram' / 'query_template.sql'
        super().__init__(template_path=str(template_path))

    def build(
        self,
        config: Dict[str, Any],
        data_inicio: str,
        data_fim: str,
        user_filters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Constrói query SQL para Instagram substituindo placeholders.

        Placeholders específicos do Instagram:
          {coluna_data} -> config['coluna_data']
          {coluna_valor} -> config['coluna_valor']
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

        # Substitui placeholders específicos do Instagram
        # Suporta dois formatos de config:
        # 1. Formato novo: config['colunas']['data'] e config['colunas']['valor']
        # 2. Formato antigo: config['coluna_data'] e config['coluna_valor']
        colunas = config.get('colunas', {})
        coluna_data = colunas.get('data') or config.get('coluna_data', 'data')
        coluna_valor = colunas.get('valor') or config.get('coluna_valor')

        if not coluna_valor:
            raise ValueError(f"Configuração inválida: 'colunas.valor' ou 'coluna_valor' não encontrado no config do gráfico {config.get('grafico_id')}")

        query = query.replace('{coluna_data}', self._sanitize_identifier(coluna_data))
        query = query.replace('{coluna_valor}', self._sanitize_identifier(coluna_valor))

        # Combina filtros de configuração + filtros do usuário
        combined_filters = {**config.get('filtros', {})}
        if user_filters:
            combined_filters.update(user_filters)

        # Constrói e substitui filtros dinâmicos
        filtros_sql = self.build_filters(combined_filters)
        query = query.replace('{filtros_dinamicos}', filtros_sql)

        return query
