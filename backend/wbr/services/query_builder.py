"""
QueryBuilder - Constrói queries SQL dinâmicas a partir de configurações
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from wbr.exceptions import InvalidConfigException


class QueryBuilder:
    """Constrói queries SQL substituindo placeholders no template"""

    def __init__(self, template_path: str = None):
        """
        Inicializa QueryBuilder.

        Args:
            template_path: Caminho para o arquivo SQL template.
                          Se None, usa 'wbr/sql/query_template.sql'
        """
        if template_path is None:
            # Caminho relativo ao módulo wbr
            module_dir = Path(__file__).parent.parent
            self.template_path = module_dir / 'sql' / 'query_template.sql'
        else:
            self.template_path = Path(template_path)

        self.template = self._load_template()

    def _load_template(self) -> str:
        """Carrega template SQL do arquivo"""
        try:
            with open(self.template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            raise InvalidConfigException(
                message=f"Template SQL não encontrado: {self.template_path}"
            )
        except Exception as e:
            raise InvalidConfigException(
                message=f"Erro ao carregar template SQL: {str(e)}"
            )

    def build(
        self,
        config: Dict[str, Any],
        data_inicio: str,
        data_fim: str,
        user_filters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Constrói query SQL substituindo placeholders do template.

        Placeholders:
          {coluna_data} -> config['colunas']['data']
          {coluna_valor} -> config['colunas']['valor']
          {tabela} -> config['tabela']
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

        # Substitui placeholders básicos
        query = query.replace('{coluna_data}', self._sanitize_identifier(config['colunas']['data']))
        query = query.replace('{coluna_valor}', self._sanitize_identifier(config['colunas']['valor']))
        query = query.replace('{tabela}', self._sanitize_identifier(config['tabela']))

        # Combina filtros de configuração + filtros do usuário
        combined_filters = {**config.get('filtros', {})}
        if user_filters:
            combined_filters.update(user_filters)

        # Constrói e substitui filtros dinâmicos
        filtros_sql = self.build_filters(combined_filters)
        query = query.replace('{filtros_dinamicos}', filtros_sql)

        return query

    @staticmethod
    def calculate_date_range(data_referencia: str) -> tuple[str, str]:
        """
        Calcula o range de datas baseado na data de referência.

        Lógica:
        - Se data_referencia = "2025-08-20"
          -> data_inicio = "2024-01-01" (início do ano anterior)
          -> data_fim = "2025-08-20" (data de referência)

        - Se data_referencia = "2024-04-15"
          -> data_inicio = "2023-01-01" (início do ano anterior)
          -> data_fim = "2024-04-15" (data de referência)

        Args:
            data_referencia: Data de referência no formato YYYY-MM-DD

        Returns:
            Tupla (data_inicio, data_fim) no formato YYYY-MM-DD

        Example:
            >>> QueryBuilder.calculate_date_range("2025-08-20")
            ('2024-01-01', '2025-08-20')
        """
        try:
            # Converte string para datetime
            ref_date = datetime.strptime(data_referencia, '%Y-%m-%d')

            # Ano anterior (início)
            ano_anterior = ref_date.year - 1
            data_inicio = f"{ano_anterior}-01-01"

            # Data de referência é o fim
            data_fim = data_referencia

            return data_inicio, data_fim

        except ValueError as e:
            raise InvalidConfigException(
                message=f"Data de referência inválida: '{data_referencia}'. Use formato YYYY-MM-DD"
            )

    def build_filters(self, filtros: Dict[str, Any]) -> str:
        """
        Converte dicionário de filtros em cláusulas SQL WHERE.

        Regras:
        - Valores None/null são ignorados
        - Strings são escapadas para prevenir SQL injection
        - Cada filtro vira uma cláusula AND

        Args:
            filtros: Dicionário {coluna: valor}

        Returns:
            String com cláusulas WHERE (ex: "AND regiao = 'Nordeste'\nAND status = 'APROVADO'")

        Example:
            Input: {"regiao": "Nordeste", "status": "APROVADO", "tipo": None}
            Output: "AND regiao = 'Nordeste'\nAND status = 'APROVADO'"
        """
        if not filtros:
            return ""

        clauses = []

        for coluna, valor in filtros.items():
            # Ignora valores None/null ou strings vazias
            if valor is None or (isinstance(valor, str) and not valor.strip()):
                continue

            # Sanitiza nome da coluna (previne SQL injection)
            coluna_safe = self._sanitize_identifier(coluna)

            # Determina tipo do valor e formata adequadamente
            if isinstance(valor, str):
                # Escapa aspas simples em strings
                valor_safe = self._sanitize_string_value(valor)
                clauses.append(f"AND {coluna_safe} = '{valor_safe}'")
            elif isinstance(valor, (int, float)):
                clauses.append(f"AND {coluna_safe} = {valor}")
            elif isinstance(valor, bool):
                clauses.append(f"AND {coluna_safe} = {str(valor).upper()}")
            elif isinstance(valor, list):
                # Para listas, usa IN
                if all(isinstance(v, str) for v in valor):
                    valores_safe = [self._sanitize_string_value(v) for v in valor]
                    valores_str = "', '".join(valores_safe)
                    clauses.append(f"AND {coluna_safe} IN ('{valores_str}')")
                else:
                    valores_str = ", ".join(str(v) for v in valor)
                    clauses.append(f"AND {coluna_safe} IN ({valores_str})")

        return '\n    '.join(clauses)

    def _sanitize_identifier(self, identifier: str) -> str:
        """
        Sanitiza identificadores SQL (nomes de tabelas, colunas).

        Remove caracteres perigosos mas mantém underscore, ponto (schemas),
        alfanuméricos e aspas duplas para identificadores quoted.

        Args:
            identifier: Nome de tabela/coluna (pode incluir aspas duplas)

        Returns:
            Identificador sanitizado

        Raises:
            InvalidConfigException: Se identificador for inválido
        """
        # Pattern: permite letras, números, underscore, ponto (para schemas)
        # e aspas duplas (para quoted identifiers)
        # Exemplos válidos:
        #   - public.users
        #   - "mapa_do_bosque"."Rgm_valor_bruto"
        #   - vendas_gshop
        if not re.match(r'^[a-zA-Z0-9_."]+$', identifier):
            raise InvalidConfigException(
                message=f"Identificador SQL inválido: '{identifier}'"
            )

        return identifier

    def _sanitize_string_value(self, value: str) -> str:
        """
        Escapa valores string para prevenir SQL injection.

        Args:
            value: String a ser escapada

        Returns:
            String escapada (aspas simples duplicadas)
        """
        # Duplica aspas simples (padrão SQL para escapar)
        return value.replace("'", "''")

    def validate_query(self, query: str) -> bool:
        """
        Valida se query contém comandos perigosos.

        Args:
            query: Query SQL a ser validada

        Returns:
            True se segura

        Raises:
            InvalidConfigException: Se query contiver comandos perigosos
        """
        # Lista de comandos perigosos
        dangerous_keywords = [
            'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE',
            'INSERT', 'UPDATE', 'GRANT', 'REVOKE', 'EXEC',
            'EXECUTE', 'UNION', '--', '/*', '*/', ';'
        ]

        query_upper = query.upper()

        for keyword in dangerous_keywords:
            if keyword in query_upper:
                raise InvalidConfigException(
                    message=f"Query contém comando proibido: '{keyword}'"
                )

        return True
