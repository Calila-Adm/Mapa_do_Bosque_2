"""
Interface abstrata para sistemas de cache
Permite múltiplas implementações (Redis, Memcached, In-Memory, etc.)
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class CacheInterface(ABC):
    """Interface para sistemas de cache"""

    @abstractmethod
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Busca valor no cache pela chave.

        Args:
            key: Chave única para buscar

        Returns:
            Dicionário com dados se encontrado, None caso contrário

        Raises:
            CacheException: Se houver erro ao buscar
        """
        pass

    @abstractmethod
    def set(self, key: str, value: Dict[str, Any], ttl: int):
        """
        Salva valor no cache com TTL (Time To Live).

        Args:
            key: Chave única para salvar
            value: Dicionário com dados a serem cacheados
            ttl: Tempo de vida em segundos

        Raises:
            CacheException: Se houver erro ao salvar
        """
        pass

    @abstractmethod
    def delete(self, key: str):
        """
        Remove valor do cache.

        Args:
            key: Chave a ser removida

        Raises:
            CacheException: Se houver erro ao remover
        """
        pass

    @abstractmethod
    def clear(self):
        """
        Limpa todo o cache.

        Raises:
            CacheException: Se houver erro ao limpar
        """
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        """
        Verifica se chave existe no cache.

        Args:
            key: Chave a ser verificada

        Returns:
            True se existe, False caso contrário
        """
        pass
