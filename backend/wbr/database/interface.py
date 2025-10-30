"""
Interface abstrata para executores de banco de dados
Permite múltiplas implementações (PostgreSQL, MySQL, Redshift, etc.)
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class DatabaseInterface(ABC):
    """Interface para executores de banco de dados"""

    @abstractmethod
    def execute(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Executa uma query SQL e retorna lista de dicionários.

        Args:
            query: Query SQL a ser executada
            params: Dicionário de parâmetros para prepared statements

        Returns:
            Lista de dicionários onde cada dict representa uma linha

        Raises:
            QueryExecutionException: Se houver erro na execução
        """
        pass

    @abstractmethod
    def validate_columns(self, tabela: str, colunas: List[str]) -> bool:
        """
        Valida se as colunas existem na tabela especificada.

        Args:
            tabela: Nome da tabela
            colunas: Lista de nomes de colunas

        Returns:
            True se todas as colunas existem, False caso contrário

        Raises:
            QueryExecutionException: Se houver erro ao validar
        """
        pass

    @abstractmethod
    def close(self):
        """
        Fecha conexões e libera recursos.
        Deve ser chamado ao finalizar uso do executor.
        """
        pass

    @abstractmethod
    def test_connection(self) -> bool:
        """
        Testa se a conexão com o banco está funcionando.

        Returns:
            True se conexão está OK, False caso contrário
        """
        pass
