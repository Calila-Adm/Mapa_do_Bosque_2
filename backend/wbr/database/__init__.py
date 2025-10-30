"""
Database executors - implementacoes para diferentes bancos de dados
"""

from .interface import DatabaseInterface
from .postgres_executor import PostgresExecutor

__all__ = [
    'DatabaseInterface',
    'PostgresExecutor',
]
