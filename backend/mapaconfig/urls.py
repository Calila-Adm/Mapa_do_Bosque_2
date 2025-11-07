from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from .views import ReactAppView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API Endpoints - IMPORTANTE: Todas as rotas da API devem vir ANTES do catch-all
    path('api/', include('api.urls')),  # API REST - autenticação e endpoints
    path('api/wbr/', include('wbr.urls')),  # WBR Analytics - API para gráficos

    # Serve arquivos estáticos do React em desenvolvimento
    # Em produção, o WhiteNoise cuida disso automaticamente
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else '',
    }) if settings.DEBUG and settings.STATICFILES_DIRS else path('', lambda x: None),

    # Catch-all: Serve o index.html do React para todas as outras rotas
    # DEVE ser a ÚLTIMA rota, para não interceptar as rotas da API
    re_path(r'^.*$', ReactAppView.as_view(), name='react-app'),
]
