from django.urls import path
from .views import (
    CadastroView,
    LoginView,
    LogoutView,
    RequestPasswordResetView,
    PasswordResetView
)

urlpatterns = [
    path('cadastro/', CadastroView.as_view(), name='cadastro'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/request/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('password-reset/confirm/', PasswordResetView.as_view(), name='password_reset'),
]