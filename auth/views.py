from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.conf import settings

# *Função para remover acentos é uma boa para implementar.


# Create your views here.
def login_view(request):
    if request.method == 'GET':
        return render(request, 'auth/login.html')
    else:
        username = request.POST.get('username').lower()
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('bosque:operacoes')
        else:
            return render(request, 'auth/login.html', {'error': 'Usuário ou senha inválidos'})

def register_view(request):
    if request.method == 'GET':
        return render(request, 'auth/register.html')
    else:
        firstname = request.POST.get('firstname').lower()
        lastname = request.POST.get('lastname').lower()
        password = request.POST.get('password')
        email = request.POST.get('email').lower()
        username = f"{firstname}.{lastname}".lower()
        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create_user(username=username, first_name=firstname, last_name=lastname, email=email, password=password)
            user.save()
            return render(request, 'auth/login.html', {'success': 'Usuário cadastrado com sucesso'})
        else:
            return render(request, 'auth/register.html', {'error': 'Usuário já cadastrado'})
        
def logout_view(request):
    logout(request)
    return redirect('auth:login')