from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    context = {
        'title': 'Mapa do Bosque',
        'message': 'Bem-vindo ao Mapa do Bosque!',
        'name': 'Edgar'
    }
    return render(request, 'main/main.html', context)

def instagram(request):
    return render(request, 'instagram/instagram.html')