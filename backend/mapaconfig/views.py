"""
Views para servir o Frontend React.
"""

from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator


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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Adicione aqui qualquer contexto que queira passar para o template
        # Por exemplo: versão do app, feature flags, etc.
        return context
