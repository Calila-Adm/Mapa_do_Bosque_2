"""
Exceções customizadas para o módulo WBR
Todas herdam de WBRException para facilitar tratamento
"""


class WBRException(Exception):
    """Exceção base para todos os erros do módulo WBR"""

    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ConfigNotFoundException(WBRException):
    """Levantada quando arquivo de configuração não é encontrado"""

    def __init__(self, grafico_id: str, config_path: str = None):
        message = f"Configuração não encontrada para gráfico '{grafico_id}'"
        details = {
            'grafico_id': grafico_id,
            'config_path': config_path
        }
        super().__init__(message, details)


class InvalidConfigException(WBRException):
    """Levantada quando configuração está inválida ou incompleta"""

    def __init__(self, message: str, grafico_id: str = None, missing_fields: list = None):
        details = {
            'grafico_id': grafico_id,
            'missing_fields': missing_fields or []
        }
        super().__init__(message, details)


class QueryExecutionException(WBRException):
    """Levantada quando há erro na execução de query SQL"""

    def __init__(self, message: str, query: str = None, db_error: str = None):
        details = {
            'query': query,
            'db_error': str(db_error) if db_error else None
        }
        super().__init__(message, details)


class DataTransformationException(WBRException):
    """Levantada quando há erro ao transformar dados para formato WBR"""

    def __init__(self, message: str, data_sample: dict = None):
        details = {
            'data_sample': data_sample
        }
        super().__init__(message, details)


class InvalidColumnException(WBRException):
    """Levantada quando colunas especificadas não existem na tabela"""

    def __init__(self, table: str, columns: list, existing_columns: list = None):
        message = f"Colunas {columns} não encontradas na tabela '{table}'"
        details = {
            'table': table,
            'required_columns': columns,
            'existing_columns': existing_columns or []
        }
        super().__init__(message, details)


class CacheException(WBRException):
    """Levantada quando há erro no sistema de cache"""

    def __init__(self, message: str, cache_key: str = None):
        details = {'cache_key': cache_key}
        super().__init__(message, details)


class DatabaseConnectionException(WBRException):
    """Levantada quando há erro na conexão com banco de dados"""

    def __init__(self, message: str, connection_string: str = None):
        details = {'connection_string': connection_string}
        super().__init__(message, details)
