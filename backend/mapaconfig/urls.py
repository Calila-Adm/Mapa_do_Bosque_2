from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')),
    path('login/', include('authentication.urls')),
    path('relatorio/', include('bosque.urls')),
]
