from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json 
from django.http import HttpResponse
from . import auth

def index_view(request):
    return render(request, 'build/index.html')

@require_POST
@csrf_exempt
def register(request):
    data = json.loads(request.body)
    try:
        if auth.userExists(data):
            return HttpResponse(json.dumps({ "msg": "user_exists" }), content_type = "application/json")

        session = auth.addUser(data).decode()
        
        return HttpResponse(json.dumps({ "msg": "success", "token": session }), content_type = "application/json")
    except Exception as e:
        print("Error", e)
        return HttpResponse(json.dumps({ "msg": "fail" }), content_type = "application/json")

@require_POST
@csrf_exempt
def login(request):
    data = json.loads(request.body)
    try:
        if not auth.userExists(data):
            return HttpResponse(json.dumps({ "msg": "user_not_found" }), content_type = "application/json")

        session = auth.verifyUser(data).decode()

        if session:
            return HttpResponse(json.dumps({ "msg": "success", "token": session }), content_type = "application/json")
        else:
            return HttpResponse(json.dumps({ "msg": "wrong creds" }), content_type = "application/json")
    except Exception as e:
        print("Error", e)
        return HttpResponse(json.dumps({ "msg": "fail" }), content_type = "application/json")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("convert/", include("convertor.urls")),
    path('register/', index_view, name = 'index'),
    path('login/', index_view, name = 'index'),
    path('player/', index_view, name = 'index'),
    path('api/register/', register, name = 'register'),
    path('api/login/', login, name = 'login'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
