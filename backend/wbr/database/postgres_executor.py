"""
PostgresExecutor - Executor de banco de dados PostgreSQL com connection pool
"""

import psycopg2
import psycopg2.pool
import psycopg2.extras
from typing import List, Dict, Any
from contextlib import contextmanager

from wbr.database.interface import DatabaseInterface
from wbr.exceptions import QueryExecutionException, DatabaseConnectionException, InvalidColumnException


class PostgresExecutor(DatabaseInterface):
    """Executor para banco PostgreSQL com connection pool para alta performance"""

    def __init__(self, connection_string: str, pool_size: int = 20, timeout: int = 30):
        """
        Inicializa executor com connection pool.

        Args:
            connection_string: String de conexão PostgreSQL
            pool_size: Número máximo de conexões no pool (default: 20)
            timeout: Timeout de queries em segundos (default: 30)
        """
        self.connection_string = connection_string
        self.pool_size = pool_size
        self.timeout = timeout
        self._pool = None
        self._initialize_pool()

    def _initialize_pool(self):
        """Inicializa o connection pool"""
        try:
            # Usa pool mínimo para evitar problemas com Supabase Session Mode
            self._pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1,  # Mínimo de 1 conexão para evitar limit do Supabase
                maxconn=10,  # Máximo de 10 conexões simultâneas (ajustado para processar gráficos em paralelo)
                dsn=self.connection_string,
                connect_timeout=10
            )
        except psycopg2.Error as e:
            raise DatabaseConnectionException(
                message=f"Erro ao criar connection pool: {str(e)}",
                connection_string=self._mask_password(self.connection_string)
            )
        except Exception as e:
            raise DatabaseConnectionException(
                message=f"Erro inesperado ao conectar ao banco: {str(e)}",
                connection_string=self._mask_password(self.connection_string)
            )

    @contextmanager
    def _get_connection(self):
        """Context manager para obter conexão do pool"""
        conn = None
        try:
            conn = self._pool.getconn()
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                self._pool.putconn(conn)

    def execute(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Executa query SQL e retorna lista de dicionários.

        Args:
            query: Query SQL (pode conter :param_name para prepared statements)
            params: Dicionário de parâmetros

        Returns:
            Lista de dicionários (cada dict é uma linha)

        Raises:
            QueryExecutionException: Se houver erro na execução
        """
        try:
            with self._get_connection() as conn:
                # Configura timeout
                with conn.cursor() as cursor:
                    cursor.execute(f"SET statement_timeout = {self.timeout * 1000}")

                    # Converte named parameters (:param) para %s
                    if params:
                        query_converted, params_list = self._convert_named_params(query, params)
                    else:
                        query_converted = query
                        params_list = None

                    # Executa query
                    cursor.execute(query_converted, params_list)

                    # Obtém nomes das colunas
                    if cursor.description:
                        columns = [desc[0] for desc in cursor.description]
                        results = cursor.fetchall()

                        # Converte para lista de dicionários
                        return [dict(zip(columns, row)) for row in results]
                    else:
                        return []

        except psycopg2.OperationalError as e:
            raise QueryExecutionException(
                message=f"Erro operacional ao executar query: {str(e)}",
                query=self._mask_query(query),
                db_error=str(e)
            )
        except psycopg2.Error as e:
            raise QueryExecutionException(
                message=f"Erro ao executar query: {str(e)}",
                query=self._mask_query(query),
                db_error=str(e)
            )
        except Exception as e:
            raise QueryExecutionException(
                message=f"Erro inesperado ao executar query: {str(e)}",
                query=self._mask_query(query),
                db_error=str(e)
            )

    def _parse_table_identifier(self, tabela: str) -> tuple:
        """
        Parse table identifier handling quoted names.

        Examples:
            "schema"."table" -> ('schema', 'table')
            schema.table -> ('schema', 'table')
            table -> ('public', 'table')
            "Schema"."Table" -> ('Schema', 'Table')
        """
        import re

        # Pattern to match quoted identifiers
        # Matches: "schema"."table" or schema.table or just table
        pattern = r'^(?:"([^"]+)"|([^.]+))(?:\.(?:"([^"]+)"|([^.]+)))?$'
        match = re.match(pattern, tabela)

        if not match:
            # Fallback to simple parsing
            if '.' in tabela:
                parts = tabela.split('.', 1)
                return (parts[0].strip('"'), parts[1].strip('"'))
            return ('public', tabela.strip('"'))

        groups = match.groups()

        # If we have schema and table (groups 0/1 for schema, 2/3 for table)
        if groups[2] is not None or groups[3] is not None:
            schema = groups[0] or groups[1]
            table = groups[2] or groups[3]
            return (schema, table)

        # If we only have table name (no schema)
        table = groups[0] or groups[1]
        return ('public', table)

    def validate_columns(self, tabela: str, colunas: List[str]) -> bool:
        """
        Valida se colunas existem na tabela.

        Args:
            tabela: Nome da tabela (pode incluir schema e aspas)
            colunas: Lista de nomes de colunas

        Returns:
            True se todas as colunas existem

        Raises:
            InvalidColumnException: Se alguma coluna não existir
        """
        # Parse table identifier properly handling quotes
        schema, table_name = self._parse_table_identifier(tabela)

        query = """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = :schema
          AND table_name = :table_name
        """

        try:
            results = self.execute(query, {'schema': schema, 'table_name': table_name})
            existing_columns = [row['column_name'] for row in results]

            missing_columns = [col for col in colunas if col not in existing_columns]

            if missing_columns:
                raise InvalidColumnException(
                    table=tabela,
                    columns=missing_columns,
                    existing_columns=existing_columns
                )

            return True

        except InvalidColumnException:
            raise
        except Exception as e:
            raise QueryExecutionException(
                message=f"Erro ao validar colunas: {str(e)}",
                query=query,
                db_error=str(e)
            )

    def test_connection(self) -> bool:
        """
        Testa se conexão está funcionando.

        Returns:
            True se conexão OK
        """
        try:
            results = self.execute("SELECT 1 as test")
            return len(results) == 1 and results[0]['test'] == 1
        except:
            return False

    def close(self):
        """Fecha connection pool e libera recursos"""
        if self._pool:
            self._pool.closeall()

    def _convert_named_params(self, query: str, params: Dict[str, Any]) -> tuple:
        """
        Converte named parameters (:name) para positional (%s).

        Args:
            query: Query com named params
            params: Dicionário de parâmetros

        Returns:
            Tupla (query_converted, params_list)
        """
        import re

        # Encontra todos os :param_name
        pattern = r':(\w+)'
        param_names = re.findall(pattern, query)

        # Substitui :param por %s
        query_converted = re.sub(pattern, '%s', query)

        # Cria lista de valores na ordem dos parâmetros
        params_list = [params.get(name) for name in param_names]

        return query_converted, params_list

    def _mask_password(self, connection_string: str) -> str:
        """Mascara password na connection string para logs"""
        import re
        return re.sub(r'password=([^&\s]+)', 'password=***', connection_string, flags=re.IGNORECASE)

    def _mask_query(self, query: str, max_length: int = 500) -> str:
        """Trunca query para logs (evita logs gigantes)"""
        if len(query) > max_length:
            return query[:max_length] + '...'
        return query

    def __enter__(self):
        """Context manager support"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager support - fecha pool ao sair"""
        self.close()
