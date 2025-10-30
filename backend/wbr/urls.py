"""
URLs do app WBR Analytics
"""

from django.urls import path
from .views import (
    WBRSingleView,
    WBRPageView,
    WBRPageConfigView,
    FilterOptionsView,
    FilteredOptionsView,
    AvailableDatesView,
    InstagramKPIsView,
    InstagramTopPostsView
)

app_name = 'wbr'

urlpatterns = [
    # Endpoint para datas disponíveis
    # GET /api/v1/wbr/filters/available-dates/
    path('filters/available-dates/', AvailableDatesView.as_view(), name='available_dates'),

    # Endpoint para opções de filtros
    # GET /api/v1/wbr/filters/options/
    path('filters/options/', FilterOptionsView.as_view(), name='filter_options'),

    # Endpoint para opções de filtros dependentes
    # GET /api/v1/wbr/filters/filtered-options/?shopping=SIG&ramo=Grupo1
    path('filters/filtered-options/', FilteredOptionsView.as_view(), name='filtered_options'),

    # Endpoint para configuração da página (sem dados)
    # GET /api/v1/wbr/page/{page_id}/config/
    path('page/<str:page_id>/config/', WBRPageConfigView.as_view(), name='page_config'),

    # Endpoint para página completa (múltiplos gráficos em paralelo)
    # GET /api/v1/wbr/page/{page_id}/
    path('page/<str:page_id>/', WBRPageView.as_view(), name='page'),

    # Endpoints do Instagram
    # GET /api/v1/wbr/instagram/kpis/
    path('instagram/kpis/', InstagramKPIsView.as_view(), name='instagram_kpis'),

    # GET /api/v1/wbr/instagram/top-posts/
    path('instagram/top-posts/', InstagramTopPostsView.as_view(), name='instagram_top_posts'),

    # Endpoint para gráfico individual
    # GET /api/v1/wbr/{grafico_id}/
    path('<str:grafico_id>/', WBRSingleView.as_view(), name='single'),
]
