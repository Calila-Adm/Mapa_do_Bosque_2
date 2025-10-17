from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin customizado para o modelo User"""

    # Campos exibidos na lista de usuários
    list_display = ('username', 'email', 'first_name', 'last_name', 'cargo', 'setor', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'cargo', 'setor')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    # Adicionar campos customizados no formulário de edição
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('cargo', 'setor')
        }),
    )

    # Adicionar campos customizados no formulário de criação
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informações Adicionais', {
            'fields': ('cargo', 'setor')
        }),
    )


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin para tokens de reset de senha"""

    list_display = ('user', 'code', 'created_at', 'is_used', 'is_valid_display')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__username', 'user__email', 'code')
    readonly_fields = ('user', 'code', 'created_at')

    def is_valid_display(self, obj):
        """Exibe se o token ainda é válido"""
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Válido'
