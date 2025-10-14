from django.shortcuts import render

def initial_view(request):
    return render(request, 'main/index.html')