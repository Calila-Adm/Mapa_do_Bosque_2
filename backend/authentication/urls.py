from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('', views.login_view, name='login'), # *Página inicial com formulário de login
    path('register/', views.register_view, name='register'), # *Página inicial com formulário de registro
    path('logout/', views.logout_view, name='logout') # *Logout do usuário
]