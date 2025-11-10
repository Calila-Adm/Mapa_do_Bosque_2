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

    def build_filters(self, filtros: Dict[str, Any], table_alias: str = None) -> str:
        """
        Sobrescreve build_filters para usar TRIM(UPPER()) nas colunas de texto.
        Adiciona prefixo de tabela quando table_alias é fornecido.

        Args:
            filtros: Dicionário de filtros
            table_alias: Alias da tabela (ex: 'CTO', 'V')
        """
        if not filtros:
            return ""

        clauses = []
        # Colunas que precisam de TRIM(UPPER()) para comparação case-insensitive
        text_columns = ['grupo', 'categoria', 'nome_loja', 'shopping']

        for coluna, valor in filtros.items():
            # Ignora valores None/null ou strings vazias
            if valor is None or (isinstance(valor, str) and not valor.strip()):
                continue

            # Sanitiza nome da coluna
            coluna_safe = self._sanitize_identifier(coluna)

            # Adiciona prefixo da tabela se fornecido
            if table_alias:
                coluna_ref = f"{table_alias}.{coluna_safe}"
            else:
                coluna_ref = coluna_safe

            # Para colunas de texto, usa TRIM(UPPER()) na comparação
            if coluna in text_columns:
                if isinstance(valor, str):
                    valor_safe = self._sanitize_string_value(valor)
                    clauses.append(f"AND TRIM(UPPER({coluna_ref})) = '{valor_safe}'")
                elif isinstance(valor, list):
                    valores_safe = [self._sanitize_string_value(v) for v in valor]
                    valores_str = "', '".join(valores_safe)
                    clauses.append(f"AND TRIM(UPPER({coluna_ref})) IN ('{valores_str}')")
            else:
                # Para outras colunas, usa o comportamento padrão
                if isinstance(valor, str):
                    valor_safe = self._sanitize_string_value(valor)
                    clauses.append(f"AND {coluna_ref} = '{valor_safe}'")
                elif isinstance(valor, (int, float)):
                    clauses.append(f"AND {coluna_ref} = {valor}")
                elif isinstance(valor, bool):
                    clauses.append(f"AND {coluna_ref} = {str(valor).upper()}")
                elif isinstance(valor, list):
                    if all(isinstance(v, str) for v in valor):
                        valores_safe = [self._sanitize_string_value(v) for v in valor]
                        valores_str = "', '".join(valores_safe)
                        clauses.append(f"AND {coluna_ref} IN ('{valores_str}')")
                    else:
                        valores_str = ", ".join(str(v) for v in valor)
                        clauses.append(f"AND {coluna_ref} IN ({valores_str})")

        return '\n    '.join(clauses)

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
          {filtros_cto} -> filtros para CTE cto_agrupado (com prefixo CTO.)
          {filtros_vendas} -> filtros para CTE vendas_agrupadas (com prefixo V.)

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

        # Constrói filtros dinâmicos com prefixo de tabela
        # Para CTO Percentual, os filtros são aplicados nas duas CTEs com aliases diferentes
        filtros_cto = self.build_filters(combined_filters, table_alias='CTO')
        filtros_vendas = self.build_filters(combined_filters, table_alias='V')

        # Se não houver filtros, substitui por string vazia
        if not filtros_cto:
            filtros_cto = ''
        if not filtros_vendas:
            filtros_vendas = ''

        # Substitui os placeholders
        query = query.replace('{filtros_cto}', filtros_cto)
        query = query.replace('{filtros_vendas}', filtros_vendas)

        return query
