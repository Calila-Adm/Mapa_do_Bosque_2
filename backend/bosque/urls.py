from django.urls import path
from . import views

app_name = 'bosque'

urlpatterns = [
    path('', views.index, name='operacoes'), # *Página com os KPI's de Operação. (login required)
    path('instagram/', views.instagram, name='instagram') # *Página com o feed do Instagram. (login required)
]