"""
ComponentFactory - Factory para criar componentes WBR com dependências injetadas
"""

import os
from django.conf import settings

from wbr.services import ConfigLoader, QueryBuilder, DataProcessor, WBRService, StructuredLogger, NullLogger
from wbr.database import PostgresExecutor
from wbr.cache import RedisCache, NullCache, MemoryCache


class ComponentFactory:
    """
    Factory para criar componentes WBR.
    Centraliza criação de objetos com todas dependências configuradas.
    """

    @staticmethod
    def create_database_executor():
        """
        Cria executor de banco de dados baseado em settings.

        Returns:
            PostgresExecutor configurado
        """
        # Usa connection string do settings
        db_url = getattr(settings, 'DATABASES')['default'].get('CONN_STRING')

        if not db_url:
            # Fallback: constrói a partir de DATABASE_URL do env
            db_url = os.environ.get('DATABASE_URL')

        pool_size = getattr(settings, 'WBR_DB_POOL_SIZE', 20)
        timeout = getattr(settings, 'WBR_QUERY_TIMEOUT', 30)

        return PostgresExecutor(
            connection_string=db_url,
            pool_size=pool_size,
            timeout=timeout
        )

    @staticmethod
    def create_cache():
        """
        Cria sistema de cache baseado em settings.

        Returns:
            - RedisCache se WBR_REDIS_URL estiver configurado
            - MemoryCache se WBR_CACHE_ENABLED=true (padrão para dev)
            - NullCache se cache estiver desabilitado
        """
        # Tenta Redis primeiro (produção)
        redis_url = getattr(settings, 'WBR_REDIS_URL', None)
        if redis_url:
            try:
                return RedisCache(redis_url)
            except Exception:
                pass  # Fallback para MemoryCache

        # Verifica se cache está habilitado
        cache_enabled = getattr(settings, 'WBR_CACHE_ENABLED', True)  # True por padrão

        if cache_enabled:
            # Usa MemoryCache (bom para desenvolvimento)
            cache_ttl = getattr(settings, 'WBR_CACHE_TTL', 3600)  # 1 hora por padrão
            return MemoryCache(default_ttl=cache_ttl)

        # Cache desabilitado
        return NullCache()

    @staticmethod
    def create_logger():
        """
        Cria logger estruturado baseado em settings.

        Returns:
            StructuredLogger configurado
        """
        log_level = getattr(settings, 'WBR_LOG_LEVEL', 'INFO')
        log_format = getattr(settings, 'WBR_LOG_FORMAT', 'json')

        return StructuredLogger(
            name='wbr',
            level=log_level,
            format_type=log_format
        )

    @staticmethod
    def create_wbr_service():
        """
        Cria WBRService com todas dependências injetadas.

        Este é o ponto de entrada principal para usar o módulo WBR.

        Returns:
            WBRService completamente configurado
        """
        return WBRService(
            config_loader=ConfigLoader(),
            query_builder=QueryBuilder(),
            db_executor=ComponentFactory.create_database_executor(),
            data_processor=DataProcessor(),
            cache=ComponentFactory.create_cache(),
            logger=ComponentFactory.create_logger()
        )
