"""
RedisCache - Implementação de cache usando Redis
"""

import redis
import json
from typing import Optional, Dict, Any

from wbr.cache.interface import CacheInterface
from wbr.exceptions import CacheException


class RedisCache(CacheInterface):
    """Implementação de cache usando Redis"""

    def __init__(self, redis_url: str):
        """
        Inicializa conexão com Redis.

        Args:
            redis_url: URL de conexão Redis (ex: redis://localhost:6379/0)

        Raises:
            CacheException: Se não conseguir conectar
        """
        try:
            self.redis = redis.from_url(
                redis_url,
                decode_responses=True,  # Decodifica strings automaticamente
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Testa conexão
            self.redis.ping()
        except Exception as e:
            raise CacheException(
                message=f"Erro ao conectar ao Redis: {str(e)}"
            )

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Busca valor no cache.

        Args:
            key: Chave única

        Returns:
            Dicionário com dados ou None

        Raises:
            CacheException: Se houver erro
        """
        try:
            value = self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except json.JSONDecodeError as e:
            raise CacheException(
                message=f"Erro ao deserializar JSON do cache: {str(e)}",
                cache_key=key
            )
        except Exception as e:
            raise CacheException(
                message=f"Erro ao buscar no cache: {str(e)}",
                cache_key=key
            )

    def set(self, key: str, value: Dict[str, Any], ttl: int):
        """
        Salva valor no cache com TTL.

        Args:
            key: Chave única
            value: Dicionário com dados
            ttl: Tempo de vida em segundos

        Raises:
            CacheException: Se houver erro
        """
        try:
            serialized = json.dumps(value, ensure_ascii=False)
            self.redis.setex(key, ttl, serialized)
        except Exception as e:
            raise CacheException(
                message=f"Erro ao salvar no cache: {str(e)}",
                cache_key=key
            )

    def delete(self, key: str):
        """
        Remove valor do cache.

        Args:
            key: Chave a ser removida

        Raises:
            CacheException: Se houver erro
        """
        try:
            self.redis.delete(key)
        except Exception as e:
            raise CacheException(
                message=f"Erro ao remover do cache: {str(e)}",
                cache_key=key
            )

    def clear(self):
        """
        Limpa todo o cache (cuidado!).

        Raises:
            CacheException: Se houver erro
        """
        try:
            self.redis.flushdb()
        except Exception as e:
            raise CacheException(
                message=f"Erro ao limpar cache: {str(e)}"
            )

    def exists(self, key: str) -> bool:
        """
        Verifica se chave existe.

        Args:
            key: Chave a verificar

        Returns:
            True se existe
        """
        try:
            return self.redis.exists(key) > 0
        except Exception:
            return False
