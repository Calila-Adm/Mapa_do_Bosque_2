"""
Logger estruturado para o módulo WBR
Implementa logs em formato JSON para fácil parsing e análise
"""

import logging
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional


class StructuredLogger:
    """Logger com formato estruturado (JSON)"""

    def __init__(self, name: str = "wbr", level: str = "INFO", format_type: str = "json"):
        """
        Inicializa logger estruturado.

        Args:
            name: Nome do logger
            level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            format_type: Formato de saída ("json" ou "text")
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        self.format_type = format_type

        # Remove handlers existentes para evitar duplicação
        if self.logger.handlers:
            self.logger.handlers.clear()

        # Adiciona handler para stdout
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, level.upper()))

        # Usa formatter customizado para JSON
        if format_type == "json":
            handler.setFormatter(self._get_json_formatter())
        else:
            handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            ))

        self.logger.addHandler(handler)

    def _get_json_formatter(self):
        """Cria formatter para saída em JSON"""

        class JsonFormatter(logging.Formatter):
            def format(self, record):
                log_data = {
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'level': record.levelname,
                    'logger': record.name,
                    'message': record.getMessage(),
                }

                # Adiciona campos extras se existirem
                if hasattr(record, 'extra_fields'):
                    log_data.update(record.extra_fields)

                # Adiciona informações de exceção se existirem
                if record.exc_info:
                    log_data['exception'] = self.formatException(record.exc_info)

                return json.dumps(log_data, ensure_ascii=False)

        return JsonFormatter()

    def _log(self, level: str, message: str, extra: Optional[Dict[str, Any]] = None):
        """Método interno para fazer log com campos extras"""
        log_method = getattr(self.logger, level.lower())

        if extra:
            # Cria LogRecord com campos extras
            log_method(message, extra={'extra_fields': extra})
        else:
            log_method(message)

    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """
        Log de debug.

        Args:
            message: Mensagem de log
            extra: Dicionário com campos adicionais
        """
        self._log('DEBUG', message, extra)

    def info(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """
        Log de informação.

        Args:
            message: Mensagem de log
            extra: Dicionário com campos adicionais
        """
        self._log('INFO', message, extra)

    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """
        Log de warning.

        Args:
            message: Mensagem de log
            extra: Dicionário com campos adicionais
        """
        self._log('WARNING', message, extra)

    def error(self, message: str, extra: Optional[Dict[str, Any]] = None, exc_info: bool = False):
        """
        Log de erro.

        Args:
            message: Mensagem de log
            extra: Dicionário com campos adicionais
            exc_info: Se True, inclui informações de exceção (traceback)
        """
        if exc_info:
            self.logger.error(message, exc_info=True, extra={'extra_fields': extra} if extra else None)
        else:
            self._log('ERROR', message, extra)

    def critical(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """
        Log crítico.

        Args:
            message: Mensagem de log
            extra: Dicionário com campos adicionais
        """
        self._log('CRITICAL', message, extra)


class NullLogger:
    """Logger que não faz nada (para testes ou quando log está desabilitado)"""

    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None):
        pass

    def info(self, message: str, extra: Optional[Dict[str, Any]] = None):
        pass

    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None):
        pass

    def error(self, message: str, extra: Optional[Dict[str, Any]] = None, exc_info: bool = False):
        pass

    def critical(self, message: str, extra: Optional[Dict[str, Any]] = None):
        pass
