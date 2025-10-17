from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Rotas de autenticação com prefixo /api/
    path('login/', include('authentication.urls')),  # Rota antiga de login (manter se necessário)
    path('relatorio/', include('bosque.urls')),
]
