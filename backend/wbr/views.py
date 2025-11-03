"""
Views Django para API WBR
Expõe endpoints REST para gráficos individuais e páginas completas
"""

from django.http import JsonResponse
from django.views import View
import traceback
from datetime import datetime

from wbr.factories import ComponentFactory
from wbr.exceptions import ConfigNotFoundException, WBRException


class WBRSingleView(View):
    """
    Endpoint para buscar dados de um único gráfico.

    GET /api/v1/wbr/{grafico_id}/

    Returns:
        JSON no formato WBR completo
    """

    def get(self, request, grafico_id):
        """
        Busca dados de um gráfico específico.

        Args:
            grafico_id: Identificador único do gráfico

        Query params:
            - data_referencia: Data de referência (YYYY-MM-DD)
            - shopping: Sigla do shopping
            - ramo: Grupo/ramo (apenas para gráficos RGM)
            - categoria: Categoria (apenas para gráficos RGM)
            - loja: Nome da loja (apenas para gráficos RGM)

        Returns:
            JsonResponse com dados WBR ou erro
        """
        try:
            service = ComponentFactory.create_wbr_service()

            # Extrai filtros da query string
            user_filters = {}
            data_referencia = request.GET.get('data_referencia')

            if request.GET.get('shopping'):
                user_filters['shopping'] = request.GET.get('shopping')

            # Filtros de RGM (apenas se for gráfico RGM)
            # Para RGM, precisamos buscar as CHAVEs correspondentes na tabela Rgm_filtros
            if 'rgm' in grafico_id.lower():
                db_executor = ComponentFactory.create_database_executor()
                chaves = []

                # Busca CHAVEs por Ramo (Grupo)
                if request.GET.get('ramo'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE grupo = '{request.GET.get('ramo')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Busca CHAVEs por Categoria
                if request.GET.get('categoria'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE categoria = '{request.GET.get('categoria')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Busca CHAVEs por Loja (name)
                if request.GET.get('loja'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE name = '{request.GET.get('loja')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Se encontrou CHAVEs, aplica filtro
                if chaves:
                    # Remove duplicatas
                    chaves = list(set(chaves))
                    # Se só tem uma CHAVE, usa =, senão usa IN
                    if len(chaves) == 1:
                        user_filters['chave'] = chaves[0]
                    else:
                        user_filters['chave'] = chaves

            resultado = service.generate(
                grafico_id,
                user_filters=user_filters if user_filters else None,
                data_referencia=data_referencia
            )
            return JsonResponse(resultado, safe=False)

        except ConfigNotFoundException as e:
            return JsonResponse({
                'error': e.message,
                'details': e.details,
                'error_type': 'ConfigNotFoundException'
            }, status=404)

        except WBRException as e:
            return JsonResponse({
                'error': e.message,
                'details': e.details,
                'error_type': type(e).__name__
            }, status=500)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro inesperado: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class WBRPageConfigView(View):
    """
    Endpoint para buscar apenas a configuração de uma página (sem dados).

    GET /api/v1/wbr/page/{page_id}/config/

    Returns:
        JSON com configuração da página (lista de gráficos, metadata, etc)
    """

    def get(self, request, page_id):
        """
        Busca configuração de uma página sem gerar dados.

        Args:
            page_id: Identificador da página/dashboard

        Returns:
            JsonResponse com configuração da página
        """
        try:
            service = ComponentFactory.create_wbr_service()
            config_loader = service.config_loader

            # Carrega configuração da página
            page_config = config_loader.load_page_config(page_id)

            return JsonResponse(page_config, safe=False)

        except ConfigNotFoundException as e:
            return JsonResponse({
                'error': f"Página '{page_id}' não encontrada",
                'details': e.details
            }, status=404)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao carregar configuração da página: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class WBRPageView(View):
    """
    Endpoint para buscar todos os gráficos de uma página.

    GET /api/v1/wbr/page/{page_id}/

    Executa queries em paralelo para alta performance.

    Returns:
        JSON com dicionário {grafico_id: dados_wbr, ...}
    """

    def get(self, request, page_id):
        """
        Busca todos os gráficos de uma página em paralelo.

        Args:
            page_id: Identificador da página/dashboard

        Returns:
            JsonResponse com dicionário de gráficos ou erro
        """
        try:
            service = ComponentFactory.create_wbr_service()
            config_loader = service.config_loader

            # Carrega configuração da página
            page_config = config_loader.load_page_config(page_id)
            grafico_ids = page_config.get('graficos', [])

            if not grafico_ids:
                return JsonResponse({
                    'error': f"Página '{page_id}' não possui gráficos configurados",
                    'page_config': page_config
                }, status=400)

            # Extrai filtros da query string
            user_filters = {}
            data_referencia = request.GET.get('data_referencia')

            if request.GET.get('shopping'):
                user_filters['shopping'] = request.GET.get('shopping')

            # Filtros de RGM (serão aplicados apenas em gráficos RGM)
            # Busca CHAVEs correspondentes na tabela Rgm_filtros
            rgm_filters = {}
            if request.GET.get('ramo') or request.GET.get('categoria') or request.GET.get('loja'):
                db_executor = ComponentFactory.create_database_executor()
                chaves = []

                # Busca CHAVEs por Ramo (Grupo)
                if request.GET.get('ramo'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE grupo = '{request.GET.get('ramo')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Busca CHAVEs por Categoria
                if request.GET.get('categoria'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE categoria = '{request.GET.get('categoria')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Busca CHAVEs por Loja (name)
                if request.GET.get('loja'):
                    query = f"""
                        SELECT DISTINCT chave
                        FROM "mapa_do_bosque"."Rgm_filtros"
                        WHERE name = '{request.GET.get('loja')}'
                    """
                    result = db_executor.execute(query)
                    chaves.extend([row['chave'] for row in result])

                # Se encontrou CHAVEs, aplica filtro
                if chaves:
                    # Remove duplicatas
                    chaves = list(set(chaves))
                    # Se só tem uma CHAVE, usa =, senão usa IN
                    if len(chaves) == 1:
                        rgm_filters['chave'] = chaves[0]
                    else:
                        rgm_filters['chave'] = chaves

            # Gera todos os gráficos SEQUENCIALMENTE (um por vez)
            # Evita esgotar o connection pool do Supabase
            response = {}
            for grafico_id in grafico_ids:
                try:
                    # Combina filtros base + filtros RGM se for gráfico RGM
                    filters_to_apply = {**user_filters}
                    if 'rgm' in grafico_id.lower():
                        filters_to_apply.update(rgm_filters)

                    response[grafico_id] = service.generate(
                        grafico_id,
                        user_filters=filters_to_apply if filters_to_apply else None,
                        data_referencia=data_referencia
                    )
                except ConfigNotFoundException as e:
                    response[grafico_id] = {
                        'error': e.message,
                        'details': e.details,
                        'status': 'failed',
                        'error_type': 'ConfigNotFoundException'
                    }
                except WBRException as e:
                    response[grafico_id] = {
                        'error': e.message,
                        'details': e.details,
                        'status': 'failed',
                        'error_type': type(e).__name__
                    }
                except Exception as e:
                    response[grafico_id] = {
                        'error': str(e),
                        'status': 'failed',
                        'error_type': type(e).__name__
                    }

            return JsonResponse(response, safe=False)

        except ConfigNotFoundException as e:
            return JsonResponse({
                'error': f"Página '{page_id}' não encontrada",
                'details': e.details
            }, status=404)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao carregar página: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class FilterOptionsView(View):
    """
    Endpoint para buscar opções disponíveis para os filtros.

    GET /api/v1/wbr/filters/options/

    Returns:
        JSON com listas de opções para cada filtro:
        {
            "datas": [...],
            "shoppings": [...],
            "ramos": [...],
            "categorias": [...],
            "lojas": [...]
        }
    """

    def get(self, request):
        """
        Busca todas as opções disponíveis para filtros.

        Returns:
            JsonResponse com opções de filtros
        """
        try:
            db_executor = ComponentFactory.create_database_executor()

            # Busca datas disponíveis da tabela dimensão dim_data
            datas_query = """
                SELECT DISTINCT "data"
                FROM "mapa_do_bosque"."dim_data"
                WHERE "data" IS NOT NULL
                ORDER BY "data" DESC
            """
            datas_result = db_executor.execute(datas_query)
            datas = [row['data'].isoformat() if isinstance(row['data'], datetime) else str(row['data'])
                    for row in datas_result]

            # Busca shoppings disponíveis da tabela dimensão dm_shopping
            shoppings_query = """
                SELECT DISTINCT "sigla", "nome_shopping"
                FROM "mapa_do_bosque"."dm_shopping"
                WHERE "sigla" IS NOT NULL
                ORDER BY "sigla"
            """
            shoppings_result = db_executor.execute(shoppings_query)
            shoppings = [
                {"value": row['sigla'], "label": row['nome_shopping']}
                for row in shoppings_result
            ]

            # Busca ramos disponíveis (coluna grupo)
            ramos_query = """
                SELECT DISTINCT grupo
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE grupo IS NOT NULL
                ORDER BY grupo
            """
            ramos_result = db_executor.execute(ramos_query)
            ramos = [row['grupo'] for row in ramos_result]

            # Busca categorias disponíveis (coluna categoria)
            categorias_query = """
                SELECT DISTINCT categoria
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE categoria IS NOT NULL
                ORDER BY categoria
            """
            categorias_result = db_executor.execute(categorias_query)
            categorias = [row['categoria'] for row in categorias_result]

            # Busca lojas disponíveis (coluna name)
            lojas_query = """
                SELECT DISTINCT name
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE name IS NOT NULL
                ORDER BY name
            """
            lojas_result = db_executor.execute(lojas_query)
            lojas = [row['name'] for row in lojas_result]

            return JsonResponse({
                'datas': datas,
                'shoppings': shoppings,
                'ramos': ramos,
                'categorias': categorias,
                'lojas': lojas
            }, safe=False)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao buscar opções de filtros: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class FilteredOptionsView(View):
    """
    Endpoint para buscar opções de filtros dependentes baseado em outros filtros selecionados.

    GET /api/v1/wbr/filters/filtered-options/?shopping=SIG&ramo=Grupo1

    Returns:
        JSON com opções filtradas
    """

    def get(self, request):
        """
        Busca opções filtradas baseadas nos filtros já aplicados.

        Query params:
            - shopping: Sigla do shopping
            - ramo: Grupo/ramo
            - categoria: Categoria

        Returns:
            JsonResponse com opções filtradas
        """
        try:
            db_executor = ComponentFactory.create_database_executor()

            # Pega filtros aplicados
            shopping = request.GET.get('shopping')
            ramo = request.GET.get('ramo')
            categoria = request.GET.get('categoria')

            # Constrói WHERE clause dinamicamente
            where_clauses = []
            if shopping:
                where_clauses.append(f"sigla = '{shopping}'")
            if ramo:
                where_clauses.append(f"grupo = '{ramo}'")
            if categoria:
                where_clauses.append(f"categoria = '{categoria}'")

            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

            # Busca ramos filtrados
            ramos_query = f"""
                SELECT DISTINCT grupo
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE {where_sql} AND grupo IS NOT NULL
                ORDER BY grupo
            """
            ramos_result = db_executor.execute(ramos_query)
            ramos = [row['grupo'] for row in ramos_result]

            # Busca categorias filtradas
            categorias_query = f"""
                SELECT DISTINCT categoria
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE {where_sql} AND categoria IS NOT NULL
                ORDER BY categoria
            """
            categorias_result = db_executor.execute(categorias_query)
            categorias = [row['categoria'] for row in categorias_result]

            # Busca lojas filtradas
            lojas_query = f"""
                SELECT DISTINCT name
                FROM "mapa_do_bosque"."Rgm_filtros"
                WHERE {where_sql} AND name IS NOT NULL
                ORDER BY name
            """
            lojas_result = db_executor.execute(lojas_query)
            lojas = [row['name'] for row in lojas_result]

            return JsonResponse({
                'ramos': ramos,
                'categorias': categorias,
                'lojas': lojas
            }, safe=False)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao buscar opções filtradas: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class AvailableDatesView(View):
    """
    Endpoint para buscar datas disponíveis nos dados.

    GET /api/v1/wbr/available-dates/

    Query params:
        - table: Nome da tabela para verificar datas (opcional, padrão: dm_vendas_gshop)

    Returns:
        JSON com lista de datas disponíveis
    """

    def get(self, request):
        """
        Retorna lista de datas únicas disponíveis nos dados.
        """
        try:
            from wbr.factories import ComponentFactory

            db_executor = ComponentFactory.create_database_executor()

            # Busca datas da tabela dimensão dim_data
            query = """
                SELECT DISTINCT "data"
                FROM "mapa_do_bosque"."dim_data"
                WHERE "data" IS NOT NULL
                ORDER BY "data" DESC
            """

            result = db_executor.execute(query, {})

            # Extrai apenas as datas em formato YYYY-MM-DD
            dates = [row['data'].strftime('%Y-%m-%d') if hasattr(row['data'], 'strftime') else str(row['data']) for row in result]

            return JsonResponse({
                'dates': dates,
                'count': len(dates)
            })

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao buscar datas disponíveis: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class InstagramKPIsView(View):
    """
    Endpoint para buscar KPIs do Instagram (seguidores, engajamento médio, alcance).

    GET /api/v1/instagram/kpis/

    Query params:
        - data_referencia: Data de referência (YYYY-MM-DD)
        - shopping: Sigla do shopping (SCIB, SBI, SBGP)

    Returns:
        JSON com KPIs do Instagram
    """

    def get(self, request):
        """Busca KPIs do Instagram."""
        try:
            db_executor = ComponentFactory.create_database_executor()

            # Extrai filtros
            data_referencia = request.GET.get('data_referencia')
            shopping = request.GET.get('shopping')

            if not data_referencia:
                return JsonResponse({
                    'error': 'data_referencia é obrigatório'
                }, status=400)

            # Query para seguidores (UserInsight)
            # Busca follower_demographics que contém a quantidade total de seguidores
            # O campo value contém um objeto JSON com os dados demográficos
            seguidores_query = f"""
                WITH all_data AS (
                  SELECT
                    'SCIB' as shopping,
                    "startTime"::date AS DATA,
                    "metricName"::text AS METRICA,
                    "value"
                  FROM "instagram-data-fetch-scib"."UserInsight"
                  WHERE "metricName"::text = 'follower_demographics'
                    AND "startTime"::date <= '{data_referencia}'::date

                  UNION ALL

                  SELECT
                    'SBI' as shopping,
                    "startTime"::date AS DATA,
                    "metricName"::text AS METRICA,
                    "value"
                  FROM "instagram-data-fetch-sbi"."UserInsight"
                  WHERE "metricName"::text = 'follower_demographics'
                    AND "startTime"::date <= '{data_referencia}'::date

                  UNION ALL

                  SELECT
                    'SBGP' as shopping,
                    "startTime"::date AS DATA,
                    "metricName"::text AS METRICA,
                    "value"
                  FROM "instagram-data-fetch-sbgp"."UserInsight"
                  WHERE "metricName"::text = 'follower_demographics'
                    AND "startTime"::date <= '{data_referencia}'::date
                ),
                latest_per_shopping AS (
                  SELECT
                    shopping,
                    DATA,
                    METRICA,
                    value,
                    ROW_NUMBER() OVER (PARTITION BY shopping ORDER BY DATA DESC) as rn
                  FROM all_data
                )
                SELECT shopping, DATA, METRICA, value
                FROM latest_per_shopping
                WHERE rn = 1
                  {f"AND shopping = '{shopping}'" if shopping else ""}
                ORDER BY DATA DESC
            """

            # Extrai ano e mês da data de referência para calcular engajamento médio do mês
            from datetime import datetime
            import calendar

            data_obj = datetime.strptime(data_referencia, '%Y-%m-%d')
            ano = data_obj.year
            mes = data_obj.month
            dias_no_mes = calendar.monthrange(ano, mes)[1]

            # Query para engajamento e alcance (PostInsight)
            # Busca dados do dia específico para alcance/impressões
            # E calcula engajamento total acumulado do início do mês até a data selecionada
            engagement_query = f"""
                WITH daily_data AS (
                      SELECT
                          'SCIB' as shopping,
                          DATE(p."postedAt") as data,
                          COALESCE(SUM(i.likes), 0) as total_likes,
                          COALESCE(SUM(i.reach),0) as total_alcance,
                          COALESCE(SUM(i.impressions),0) as total_impressoes,
                          COALESCE(SUM(i.comments), 0) as total_comentarios,
                          COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                          COALESCE(SUM(i.saved), 0) as total_salvos,
                          COUNT(DISTINCT p.id) as total_posts
                      FROM "instagram-data-fetch-scib"."Post" p
                      LEFT JOIN "instagram-data-fetch-scib"."PostInsight" i ON p.id = i."postId"
                      WHERE DATE(p."postedAt") = '{data_referencia}'
                      GROUP BY DATE(p."postedAt")

                      UNION ALL

                      SELECT
                          'SBGP' as shopping,
                          DATE(p."postedAt") as data,
                          COALESCE(SUM(i.likes), 0) as total_likes,
                          COALESCE(SUM(i.reach),0) as total_alcance,
                          COALESCE(SUM(i.impressions),0) as total_impressoes,
                          COALESCE(SUM(i.comments), 0) as total_comentarios,
                          COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                          COALESCE(SUM(i.saved), 0) as total_salvos,
                          COUNT(DISTINCT p.id) as total_posts
                      FROM "instagram-data-fetch-sbgp"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbgp"."PostInsight" i ON p.id = i."postId"
                      WHERE DATE(p."postedAt") = '{data_referencia}'
                      GROUP BY DATE(p."postedAt")

                      UNION ALL

                      SELECT
                          'SBI' as shopping,
                          DATE(p."postedAt") as data,
                          COALESCE(SUM(i.likes), 0) as total_likes,
                          COALESCE(SUM(i.reach),0) as total_alcance,
                          COALESCE(SUM(i.impressions),0) as total_impressoes,
                          COALESCE(SUM(i.comments), 0) as total_comentarios,
                          COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                          COALESCE(SUM(i.saved), 0) as total_salvos,
                          COUNT(DISTINCT p.id) as total_posts
                      FROM "instagram-data-fetch-sbi"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbi"."PostInsight" i ON p.id = i."postId"
                      WHERE DATE(p."postedAt") = '{data_referencia}'
                      GROUP BY DATE(p."postedAt")
                  ),
                  month_to_date_engagement AS (
                      -- Engajamento acumulado do dia 1 do mês até a data selecionada
                      SELECT
                          'SCIB' as shopping,
                          SUM(COALESCE(i.likes, 0) + COALESCE(i.comments, 0) +
                              COALESCE(i.shares, 0) + COALESCE(i.saved, 0)) as engajamento_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-scib"."Post" p
                      LEFT JOIN "instagram-data-fetch-scib"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'

                      UNION ALL

                      SELECT
                          'SBGP' as shopping,
                          SUM(COALESCE(i.likes, 0) + COALESCE(i.comments, 0) +
                              COALESCE(i.shares, 0) + COALESCE(i.saved, 0)) as engajamento_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-sbgp"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbgp"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'

                      UNION ALL

                      SELECT
                          'SBI' as shopping,
                          SUM(COALESCE(i.likes, 0) + COALESCE(i.comments, 0) +
                              COALESCE(i.shares, 0) + COALESCE(i.saved, 0)) as engajamento_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-sbi"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbi"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'
                  ),
                  month_to_date_reach AS (
                      -- Alcance acumulado do dia 1 do mês até a data selecionada
                      SELECT
                          'SCIB' as shopping,
                          SUM(COALESCE(i.reach, 0)) as alcance_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-scib"."Post" p
                      LEFT JOIN "instagram-data-fetch-scib"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'

                      UNION ALL

                      SELECT
                          'SBGP' as shopping,
                          SUM(COALESCE(i.reach, 0)) as alcance_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-sbgp"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbgp"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'

                      UNION ALL

                      SELECT
                          'SBI' as shopping,
                          SUM(COALESCE(i.reach, 0)) as alcance_total_acumulado,
                          COUNT(DISTINCT DATE(p."postedAt")) as dias_com_posts
                      FROM "instagram-data-fetch-sbi"."Post" p
                      LEFT JOIN "instagram-data-fetch-sbi"."PostInsight" i ON p.id = i."postId"
                      WHERE EXTRACT(YEAR FROM p."postedAt") = {ano}
                        AND EXTRACT(MONTH FROM p."postedAt") = {mes}
                        AND DATE(p."postedAt") <= '{data_referencia}'
                  )
                  SELECT
                      d.shopping,
                      d.data,
                      d.total_likes,
                      d.total_alcance,
                      d.total_impressoes,
                      d.total_comentarios,
                      d.total_compartilhamentos,
                      d.total_salvos,
                      (d.total_likes + d.total_comentarios + d.total_compartilhamentos + d.total_salvos) as engajamento_total,
                      d.total_posts,
                      COALESCE(m.engajamento_total_acumulado, 0) as engajamento_total_mes,
                      COALESCE(m.dias_com_posts, 0) as dias_disponiveis,
                      CASE
                        WHEN COALESCE(m.dias_com_posts, 0) > 0
                        THEN COALESCE(m.engajamento_total_acumulado / m.dias_com_posts, 0)
                        ELSE 0
                      END as engajamento_medio_dia,
                      COALESCE(r.alcance_total_acumulado, 0) as alcance_total_mes,
                      CASE
                        WHEN COALESCE(r.dias_com_posts, 0) > 0
                        THEN COALESCE(r.alcance_total_acumulado / r.dias_com_posts, 0)
                        ELSE 0
                      END as alcance_medio_dia
                  FROM daily_data d
                  LEFT JOIN month_to_date_engagement m ON d.shopping = m.shopping
                  LEFT JOIN month_to_date_reach r ON d.shopping = r.shopping
                  {f"WHERE d.shopping = '{shopping}'" if shopping else ""}
                  ORDER BY d.data DESC, d.shopping
            """

            seguidores_result = db_executor.execute(seguidores_query)
            engagement_result = db_executor.execute(engagement_query)

            return JsonResponse({
                'seguidores': seguidores_result,
                'engagement': engagement_result
            }, safe=False)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao buscar KPIs do Instagram: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)


class InstagramTopPostsView(View):
    """
    Endpoint para buscar Top 3 Posts com melhor engajamento.

    GET /api/v1/instagram/top-posts/

    Query params:
        - data_referencia: Data de referência (YYYY-MM-DD) - opcional
        - shopping: Sigla do shopping (SCIB, SBI, SBGP)
        - limit: Número de posts a retornar (padrão: 3)

    Returns:
        JSON com lista dos top posts
    """

    def get(self, request):
        """Busca Top Posts do Instagram."""
        try:
            db_executor = ComponentFactory.create_database_executor()

            # Extrai filtros
            data_referencia = request.GET.get('data_referencia')
            shopping = request.GET.get('shopping')
            limit = request.GET.get('limit', '3')

            # Constrói WHERE clause para data do mês
            # Se data_referencia for fornecida, busca posts do mês inteiro
            if data_referencia:
                from datetime import datetime
                data_obj = datetime.strptime(data_referencia, '%Y-%m-%d')
                ano = data_obj.year
                mes = data_obj.month
                date_filter = f"AND EXTRACT(YEAR FROM p.\"postedAt\") = {ano} AND EXTRACT(MONTH FROM p.\"postedAt\") = {mes}"
            else:
                date_filter = ""

            query = f"""
                WITH all_data AS (
                    SELECT
                        'SCIB' as shopping,
                        "mediaUrl" as link_foto,
                        "permalink" as link_insta,
                        DATE(p."postedAt") as data,
                        COALESCE(SUM(i.likes), 0) as total_likes,
                        COALESCE(SUM(i.comments), 0) as total_comentarios,
                        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                        COALESCE(SUM(i.saved), 0) as total_salvos
                    FROM "instagram-data-fetch-scib"."Post" p
                    LEFT JOIN "instagram-data-fetch-scib"."PostInsight" i ON p.id = i."postId"
                    WHERE 1 = 1 {date_filter}
                    GROUP BY DATE(p."postedAt"),"mediaUrl","permalink"

                    UNION ALL

                    SELECT
                        'SBGP' as shopping,
                        "mediaUrl" as link_foto,
                        "permalink" as link_insta,
                        DATE(p."postedAt") as data,
                        COALESCE(SUM(i.likes), 0) as total_likes,
                        COALESCE(SUM(i.comments), 0) as total_comentarios,
                        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                        COALESCE(SUM(i.saved), 0) as total_salvos
                    FROM "instagram-data-fetch-sbgp"."Post" p
                    LEFT JOIN "instagram-data-fetch-sbgp"."PostInsight" i ON p.id = i."postId"
                    WHERE 1 = 1 {date_filter}
                    GROUP BY DATE(p."postedAt"),"mediaUrl","permalink"

                    UNION ALL

                    SELECT
                        'SBI' as shopping,
                        "mediaUrl" as link_foto,
                        "permalink" as link_insta,
                        DATE(p."postedAt") as data,
                        COALESCE(SUM(i.likes), 0) as total_likes,
                        COALESCE(SUM(i.comments), 0) as total_comentarios,
                        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
                        COALESCE(SUM(i.saved), 0) as total_salvos
                    FROM "instagram-data-fetch-sbi"."Post" p
                    LEFT JOIN "instagram-data-fetch-sbi"."PostInsight" i ON p.id = i."postId"
                    WHERE 1 = 1 {date_filter}
                    GROUP BY DATE(p."postedAt"),"mediaUrl","permalink"
                  )
                SELECT
                    shopping,
                    data,
                    link_foto,
                    link_insta,
                    total_likes,
                    total_comentarios,
                    total_compartilhamentos,
                    total_salvos,
                    (total_likes + total_comentarios + total_compartilhamentos + total_salvos) as engajamento_total
                FROM all_data
                {f"WHERE shopping = '{shopping}'" if shopping else ""}
                ORDER BY engajamento_total DESC, data DESC
                LIMIT {limit}
            """

            result = db_executor.execute(query)

            return JsonResponse({
                'posts': result
            }, safe=False)

        except Exception as e:
            return JsonResponse({
                'error': f'Erro ao buscar top posts do Instagram: {str(e)}',
                'error_type': type(e).__name__
            }, status=500)
