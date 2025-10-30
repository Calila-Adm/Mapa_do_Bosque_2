"""
ConfigLoader - Carrega e valida configurações JSON dos gráficos
"""

import json
import os
from typing import Dict, Any
from pathlib import Path

from wbr.exceptions import ConfigNotFoundException, InvalidConfigException


class ConfigLoader:
    """Carrega e valida configurações de gráficos a partir de arquivos JSON"""

    def __init__(self, config_dir: str = None):
        """
        Inicializa o ConfigLoader.

        Args:
            config_dir: Diretório onde ficam os arquivos JSON de configuração.
                       Se None, usa 'wbr/config/graficos' relativo ao módulo.
        """
        if config_dir is None:
            # Caminho relativo ao módulo wbr
            module_dir = Path(__file__).parent.parent
            self.config_dir = module_dir / 'config' / 'graficos'
        else:
            self.config_dir = Path(config_dir)

        # Garante que o diretório existe
        if not self.config_dir.exists():
            raise ConfigNotFoundException(
                grafico_id="<unknown>",
                config_path=str(self.config_dir)
            )

    def load(self, grafico_id: str) -> Dict[str, Any]:
        """
        Carrega configuração JSON de um gráfico.

        Args:
            grafico_id: Identificador único do gráfico

        Returns:
            Dicionário com a configuração carregada

        Raises:
            ConfigNotFoundException: Se arquivo não for encontrado
            InvalidConfigException: Se JSON estiver mal formatado
        """
        config_file = self.config_dir / f"{grafico_id}.json"

        if not config_file.exists():
            raise ConfigNotFoundException(
                grafico_id=grafico_id,
                config_path=str(config_file)
            )

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except json.JSONDecodeError as e:
            raise InvalidConfigException(
                message=f"Erro ao fazer parse do JSON: {str(e)}",
                grafico_id=grafico_id
            )
        except Exception as e:
            raise InvalidConfigException(
                message=f"Erro ao carregar configuração: {str(e)}",
                grafico_id=grafico_id
            )

        return config

    def validate(self, config: Dict[str, Any]) -> bool:
        """
        Valida se configuração possui todos os campos obrigatórios.

        Estrutura esperada (padrão):
        {
          "grafico_id": "string",
          "tabela": "string",
          "colunas": {
            "data": "string",
            "valor": "string"
          },
          "filtros": {
            "key": "value" | null
          },
          "agrupamento": "semanal" | "mensal"
        }

        Estrutura esperada (Instagram):
        {
          "grafico_id": "string",
          "coluna_data": "string",
          "coluna_valor": "string",
          "use_instagram_template": true
        }

        Args:
            config: Dicionário com configuração

        Returns:
            True se válida

        Raises:
            InvalidConfigException: Se configuração estiver inválida
        """
        # Se é configuração do Instagram, valida campos específicos
        if config.get('use_instagram_template', False):
            required_fields = ['grafico_id', 'coluna_data', 'coluna_valor']
            missing_fields = [field for field in required_fields if field not in config]

            if missing_fields:
                raise InvalidConfigException(
                    message=f"Campos obrigatórios ausentes (Instagram): {', '.join(missing_fields)}",
                    grafico_id=config.get('grafico_id', '<unknown>'),
                    missing_fields=missing_fields
                )

            return True

        # Validação padrão para gráficos normais
        required_fields = ['grafico_id', 'tabela', 'colunas', 'filtros', 'agrupamento']
        missing_fields = [field for field in required_fields if field not in config]

        if missing_fields:
            raise InvalidConfigException(
                message=f"Campos obrigatórios ausentes: {', '.join(missing_fields)}",
                grafico_id=config.get('grafico_id', '<unknown>'),
                missing_fields=missing_fields
            )

        # Valida campo 'colunas'
        if not isinstance(config['colunas'], dict):
            raise InvalidConfigException(
                message="Campo 'colunas' deve ser um dicionário",
                grafico_id=config['grafico_id']
            )

        colunas_required = ['data', 'valor']
        colunas_missing = [col for col in colunas_required if col not in config['colunas']]

        if colunas_missing:
            raise InvalidConfigException(
                message=f"Colunas obrigatórias ausentes: {', '.join(colunas_missing)}",
                grafico_id=config['grafico_id'],
                missing_fields=colunas_missing
            )

        # Valida agrupamento
        if config['agrupamento'] not in ['semanal', 'mensal']:
            raise InvalidConfigException(
                message=f"Agrupamento inválido: '{config['agrupamento']}'. Deve ser 'semanal' ou 'mensal'.",
                grafico_id=config['grafico_id']
            )

        # Valida filtros (deve ser dict)
        if not isinstance(config['filtros'], dict):
            raise InvalidConfigException(
                message="Campo 'filtros' deve ser um dicionário",
                grafico_id=config['grafico_id']
            )

        return True

    def load_page_config(self, page_id: str) -> Dict[str, Any]:
        """
        Carrega configuração de uma página (dashboard).

        Args:
            page_id: Identificador da página

        Returns:
            Dicionário com configuração da página

        Raises:
            ConfigNotFoundException: Se arquivo não for encontrado
        """
        pages_dir = self.config_dir.parent / 'pages'
        config_file = pages_dir / f"{page_id}.json"

        if not config_file.exists():
            raise ConfigNotFoundException(
                grafico_id=page_id,
                config_path=str(config_file)
            )

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except json.JSONDecodeError as e:
            raise InvalidConfigException(
                message=f"Erro ao fazer parse do JSON: {str(e)}",
                grafico_id=page_id
            )

        # Valida estrutura da página
        if 'page_id' not in config or 'graficos' not in config:
            raise InvalidConfigException(
                message="Configuração de página deve conter 'page_id' e 'graficos'",
                grafico_id=page_id
            )

        if not isinstance(config['graficos'], list):
            raise InvalidConfigException(
                message="Campo 'graficos' deve ser uma lista",
                grafico_id=page_id
            )

        return config
