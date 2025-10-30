"""
NullCache - Cache vazio para testes ou quando cache está desabilitado
"""

from typing import Optional, Dict, Any

from wbr.cache.interface import CacheInterface


class NullCache(CacheInterface):
    """
    Implementação vazia de cache.
    Útil para testes ou quando cache está desabilitado.
    Todas as operações não fazem nada.
    """

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Sempre retorna None (cache miss)"""
        return None

    def set(self, key: str, value: Dict[str, Any], ttl: int):
        """Não faz nada"""
        pass

    def delete(self, key: str):
        """Não faz nada"""
        pass

    def clear(self):
        """Não faz nada"""
        pass

    def exists(self, key: str) -> bool:
        """Sempre retorna False"""
        return False
