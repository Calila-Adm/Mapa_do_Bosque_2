from django.urls import path
from . import views

app_name = 'bosque'

urlpatterns = [
    path('', views.index, name='operacoes'),
    path('Instagram/', views.instagram, name='instagram')
]