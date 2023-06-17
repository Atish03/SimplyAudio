from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
import json 
from django.http import HttpResponse
from . import auth
from pymongo import MongoClient
import jwt
from bson.objectid import ObjectId

# def index_view(request):
#     return render(request, 'build/index.html')

client = MongoClient( host = "mongo", port = 27017 )

db_handle = client['simplyaudio']
file_collection = db_handle["files"]
user_collection = db_handle["users"]

secret = "Sup3r_s3cret"

@require_POST
@csrf_exempt
def register(request):
    data = json.loads(request.body)
    try:
        if auth.userExists(data):
            return HttpResponse(json.dumps({ "msg": "user_exists" }), content_type = "application/json")

        session = auth.addUser(data)
        
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

        session = auth.verifyUser(data)

        if session:
            return HttpResponse(json.dumps({ "msg": "success", "token": session }), content_type = "application/json")
        else:
            return HttpResponse(json.dumps({ "msg": "wrong creds" }), content_type = "application/json")
    except Exception as e:
        print("Error", e)
        return HttpResponse(json.dumps({ "msg": "fail" }), content_type = "application/json")

@require_POST
@csrf_exempt
def verify(request):
    token = json.loads(request.body)['token']
    verified = auth.verifyToken(token)
    return HttpResponse(json.dumps({ "msg": verified }), content_type = "application/json")

@require_GET
def getUserLib(request):
    cookie = request.COOKIES["session_"]

    try:
        user_data = jwt.decode(cookie, key = secret, algorithms = ['HS256', ])
        user_data = user_collection.find_one({ "_id": ObjectId(user_data["_id"]) })
    except:
        return HttpResponse("Please log out and login again")
    
    library = user_data["library"]

    toSend = { "files": [] }

    i = 1

    for l in library:
        file_hash = l
        user_named = library[l]

        req_file = file_collection.find_one({ "file_hash": file_hash })

        toSend["files"].append({"file_name": req_file["file_name"], "user_named": user_named, "alternate_names": req_file["alternate_names"], "hash": req_file["file_hash"] })

        i += 1

    reponse = JsonResponse(toSend)

    return reponse

@require_GET
def getFile(request):
    hash = request.GET.get("hash")
    req_file = file_collection.find_one({ "file_hash": hash })
    del req_file["_id"]
    return HttpResponse(json.dumps(req_file), content_type = "application/json")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/convert/", include("convertor.urls")),
    path('api/register/', register, name = 'register'),
    path('api/login/', login, name = 'login'),
    path('api/verify/', verify, name = 'verify'),
    path("api/getuserlib", getUserLib, name = 'getuserlib'),
    path("api/getfile/", getFile, name = 'getfile')
]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
