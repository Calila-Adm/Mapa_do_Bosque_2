"""
MemoryCache - Cache em memória usando dicionário Python
Útil para desenvolvimento e ambientes sem Redis
"""

import time
from typing import Any, Optional
from .interface import CacheInterface


class MemoryCache(CacheInterface):
    """
    Implementação de cache em memória usando dicionário Python.

    ATENÇÃO: Este cache é local ao processo. Em ambientes com múltiplos
    workers (Gunicorn, uWSGI), cada worker terá seu próprio cache.
    Para produção com múltiplos workers, use RedisCache.
    """

    def __init__(self, default_ttl: int = 3600):
        """
        Inicializa cache em memória.

        Args:
            default_ttl: Tempo de vida padrão em segundos (default: 1 hora)
        """
        self._cache = {}
        self._timestamps = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """
        Busca valor do cache.

        Args:
            key: Chave única

        Returns:
            Valor armazenado ou None se não existir/expirado
        """
        if key not in self._cache:
            return None

        # Verifica expiração
        if key in self._timestamps:
            timestamp, ttl = self._timestamps[key]
            if time.time() - timestamp > ttl:
                # Expirou, remove
                del self._cache[key]
                del self._timestamps[key]
                return None

        return self._cache[key]

    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Armazena valor no cache.

        Args:
            key: Chave única
            value: Valor a armazenar (deve ser serializável)
            ttl: Tempo de vida em segundos (None = usa default)

        Returns:
            True se sucesso
        """
        self._cache[key] = value
        self._timestamps[key] = (time.time(), ttl or self.default_ttl)
        return True

    def delete(self, key: str) -> bool:
        """
        Remove valor do cache.

        Args:
            key: Chave a remover

        Returns:
            True se removido, False se não existia
        """
        if key in self._cache:
            del self._cache[key]
            if key in self._timestamps:
                del self._timestamps[key]
            return True
        return False

    def clear(self) -> bool:
        """
        Limpa todo o cache.

        Returns:
            True se sucesso
        """
        self._cache.clear()
        self._timestamps.clear()
        return True

    def cleanup_expired(self):
        """
        Remove entradas expiradas do cache.
        Deve ser chamado periodicamente para liberar memória.
        """
        current_time = time.time()
        expired_keys = []

        for key, (timestamp, ttl) in self._timestamps.items():
            if current_time - timestamp > ttl:
                expired_keys.append(key)

        for key in expired_keys:
            if key in self._cache:
                del self._cache[key]
            if key in self._timestamps:
                del self._timestamps[key]

        return len(expired_keys)
