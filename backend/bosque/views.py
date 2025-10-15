from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth.decorators import login_required

# *Ajustar a função para pegar o usuário logado.
@login_required
def index(request):
    Name = (request.user.first_name).capitalize()
    context = {
        'message': 'Bem-vindo ao Mapa do Bosque!',
        'name': Name
    }
    return render(request, 'operacoes/main.html', context)

@login_required
def instagram(request):
    return render(request, 'instagram/instagram.html')