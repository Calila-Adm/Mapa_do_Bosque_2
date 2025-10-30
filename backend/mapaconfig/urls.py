from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # API REST - autenticação e endpoints
    path('api/wbr/', include('wbr.urls')),  # WBR Analytics - API para gráficos
]
