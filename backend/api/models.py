 # *Models é onde definimos as estruturas de dados que serão armazenadas no banco de dados.
 # *Cada classe representa uma tabela no banco de dados, e cada atributo da classe representa uma coluna nessa tabela.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random
import string



class User(AbstractUser):
    # *AbstractUser já herda campos como username, password, email, first_name, last_name, etc.
    # *Só preciso adicionar os campos extras que preciso.
    cargo = models.TextField(
        blank=True,
        null=True,
        choices=[
            ('Advogado', 'Advogado'),
            ('Analista', 'Analista'),
            ('Gerente executivo', 'Gerente executivo'),
            ('Assistente adm', 'Assistente adm'),
            ('Estagiário', 'Estagiário'),
            ('Fiscal', 'Fiscal'),
            ('Jovem aprendiz', 'Jovem aprendiz'),
            ('Supervisor', 'Supervisor'),
            ('Auditor', 'Auditor'),
            ('Coordenador', 'Coordenador'),
            ('Operador', 'Operador'),
            ('Executivo de vendas', 'Executivo de vendas'),
            ('Gerente', 'Gerente'),
            ('Diretor', 'Diretor'),
            ('Auxiliar', 'Auxiliar'),
        ],
        default='Analista'
    )
    setor = models.TextField(
        blank=True,
        null=True,
        choices=[
            ('Marketing', 'Marketing'),
            ('Comercial', 'Comercial'),
            ('Auditoria', 'Auditoria'),
            ('Recursos Humanos', 'Recursos Humanos'),
            ('TI', 'TI'),
            ('TD', 'TD'),
            ('Contabilidade', 'Contabilidade'),
            ('Outros', 'Outros'),
        ],
        default='Outros'
    )

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username


class PasswordResetToken(models.Model):
    """
    Modelo para armazenar códigos de reset de senha.
    Cada código é válido por 15 minutos.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    code = models.CharField(max_length=6)  # Código de 6 dígitos
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)  # Marca se o código já foi usado

    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'

    def __str__(self):
        return f"{self.user.username} - {self.code}"

    def is_valid(self):
        """Verifica se o token ainda é válido (15 minutos)"""
        if self.is_used:
            return False

        now = timezone.now()
        expiration_time = self.created_at + timezone.timedelta(minutes=15)
        return now <= expiration_time

    @staticmethod
    def generate_code():
        """Gera um código aleatório de 6 dígitos"""
        return ''.join(random.choices(string.digits, k=6))