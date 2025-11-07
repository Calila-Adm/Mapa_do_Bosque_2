"""
Views para servir o Frontend React.
"""

import os
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.conf import settings
from django.http import HttpResponse


@method_decorator(never_cache, name='dispatch')
class ReactAppView(TemplateView):
    """
    View que serve o index.html do React para todas as rotas não-API.

    Esta view é um "catch-all" que permite o React Router funcionar corretamente.
    Quando um usuário acessa qualquer rota (ex: /login, /dashboard, etc),
    o Django serve o index.html e deixa o React Router lidar com o roteamento.

    O decorator @never_cache garante que o index.html nunca seja cacheado,
    evitando problemas com novas versões do app.
    """
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        # Verificar se o index.html existe
        frontend_dir = getattr(settings, 'FRONTEND_DIR', None)
        if frontend_dir:
            index_path = os.path.join(frontend_dir, 'index.html')
            if not os.path.exists(index_path):
                return HttpResponse(
                    f"<h1>Frontend Error</h1>"
                    f"<p>index.html not found at: {index_path}</p>"
                    f"<p>FRONTEND_DIR: {frontend_dir}</p>"
                    f"<p>Directory exists: {os.path.exists(frontend_dir)}</p>"
                    f"<p>Files in directory: {os.listdir(frontend_dir) if os.path.exists(frontend_dir) else 'N/A'}</p>",
                    status=500
                )
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Adicione aqui qualquer contexto que queira passar para o template
        # Por exemplo: versão do app, feature flags, etc.
        return context
