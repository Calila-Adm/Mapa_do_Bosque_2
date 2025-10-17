from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate

from .serializers import (
    CadastroSerializer,
    RequestPasswordResetSerializer,
    PasswordResetSerializer
)
from .models import User, PasswordResetToken

class CadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        dados = request.data

        serializer = CadastroSerializer(data=dados)

        if serializer.is_valid():
            usuario = serializer.save()
            token, created = Token.objects.get_or_create(user=usuario)
            return Response({
                "message": "Usuário cadastrado com sucesso.",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        dados = request.data
        username = dados.get('username')
        password = dados.get('password')

        usuario = authenticate(
            username=username,
            password=password
            )

        if usuario is not None:
            token, created = Token.objects.get_or_create(user=usuario)
            return Response({
                "message": "Login realizado com sucesso.",
                "token": token.key
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": "Credenciais inválidas."
            }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Só quem está logado pode fazer logout

    def post(self, request):
        # Pega o token do usuário atual e deleta
        request.user.auth_token.delete()

        return Response({
            "message": "Logout realizado com sucesso."
        }, status=status.HTTP_200_OK)


class RequestPasswordResetView(APIView):
    """
    View para solicitar reset de senha.
    Gera um código de 6 dígitos e envia por email.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)

            # Gerar código de 6 dígitos
            code = PasswordResetToken.generate_code()

            # Criar o token no banco
            reset_token = PasswordResetToken.objects.create(
                user=user,
                code=code
            )

            # Enviar email com o código
            subject = 'Recuperação de Senha - Mapa do Bosque'
            message = f'''
Olá {user.first_name or user.username},

Você solicitou a recuperação de senha para sua conta no Mapa do Bosque.

Seu código de verificação é: {code}

Este código é válido por 15 minutos.

Se você não solicitou essa recuperação, ignore este email.

Atenciosamente,
Equipe Mapa do Bosque
            '''

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )

                return Response({
                    "message": "Código de recuperação enviado para o seu email.",
                    "email": email,
                    "expires_in": "15 minutos"
                }, status=status.HTTP_200_OK)

            except Exception as e:
                # Se falhar ao enviar email, retornar erro
                return Response({
                    "error": f"Erro ao enviar email: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    """
    View para confirmar o reset de senha com o código.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            reset_token = serializer.validated_data['reset_token']
            new_password = serializer.validated_data['new_password']

            # Alterar a senha do usuário
            user.set_password(new_password)
            user.save()

            # Marcar o código como usado
            reset_token.is_used = True
            reset_token.save()

            return Response({
                "message": "Senha alterada com sucesso! Você já pode fazer login com a nova senha."
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)