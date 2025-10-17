from rest_framework import serializers
from .models import User, PasswordResetToken
from django.contrib.auth import authenticate

# ? ModelSerializer é usado quando vamos criar ou atualizar instâncias de modelos Django.
# ? Ele mapeia automaticamente os campos do modelo para os campos do serializer.
class CadastroSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'cargo',
            'setor',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    SUFIXOS_DOMINIOS = [
        'jccbr.com',
        'iguatemifortaleza.com.br',
        'bosquegraopara.com.br',
        'bosquedosipes.com',
        'calila.com.br'
    ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "As senhas não coincidem."})
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                "username": "Este nome de usuário já está em uso."
            })
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                "email": "Este email já está em uso."
            })
        
        if len(data['password']) < 8:
            raise serializers.ValidationError({
                "password": "A senha deve ter pelo menos 8 caracteres."
            })

        if data['email'].split('@')[1] not in self.SUFIXOS_DOMINIOS:
            raise serializers.ValidationError({
                "email": "O email deve pertencer a um dos domínios permitidos."
            })
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        # *create_user criptografa a senha automaticamente
        usuario = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            cargo=validated_data.get('cargo', 'Analista'),
            setor=validated_data.get('setor', 'Desconhecido'),
        )
        return usuario

# ? Serializer é usado quando não vamos salvar nada no banco de dados.
# ? Ele é útil para validação de dados simples, como em formulários de login.
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        usuario = authenticate(
            username=username,
            password=password
        )

        if not usuario:
            raise serializers.ValidationError("Credenciais inválidas.")

        if not usuario.is_active:
            raise serializers.ValidationError("Usuário inativo.")

        data['usuario'] = usuario
        return data


class RequestPasswordResetSerializer(serializers.Serializer):
    """Serializer para solicitar reset de senha (envia código por email)"""
    email = serializers.EmailField()

    def validate_email(self, value):
        """Verifica se o email existe no sistema"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Nenhum usuário encontrado com este email.")
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer para confirmar reset de senha com código"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        # Validar se as senhas coincidem
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "As senhas não coincidem."
            })

        # Verificar se o usuário existe
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "email": "Nenhum usuário encontrado com este email."
            })

        # Verificar se o código existe e é válido
        try:
            reset_token = PasswordResetToken.objects.filter(
                user=user,
                code=data['code']
            ).latest('created_at')
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({
                "code": "Código inválido."
            })

        # Verificar se o código ainda é válido (não expirou)
        if not reset_token.is_valid():
            raise serializers.ValidationError({
                "code": "Este código expirou ou já foi usado."
            })

        data['user'] = user
        data['reset_token'] = reset_token
        return data