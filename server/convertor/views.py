from django.shortcuts import render
from django.http import HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
import datetime, time
import subprocess
import base64
from . import genWave
import os
import shutil
import requests
import json
from pymongo import MongoClient
import hashlib
from server import auth
from bson.objectid import ObjectId

# Create your views here.

client = MongoClient( host = "mongo", port = 27017 )

db_handle = client['simplyaudio']
file_collection = db_handle["files"]
user_collection = db_handle["users"]

save_path = "../streamer/uploads/"

@csrf_exempt
def index(request):
    amps = [0]
    if request.method == "POST":
        post_data = json.loads(request.body)
        data = post_data["content"]
        original_file_name = post_data["fileName"]
        token = post_data["token"]

        user = auth.verifyToken(token)

        os.makedirs(save_path, exist_ok = True)

        byteData = base64.b64decode(",".join(data.split(',')[1:]))
        fileHash = hashlib.md5(byteData).hexdigest()

        exists = file_collection.find_one({ "file_hash": fileHash })

        if user:
            current_user = user_collection.find_one({ "_id": ObjectId(user["_id"]) })
            current_user["library"][fileHash] = original_file_name
            user_collection.update_one({ "_id": ObjectId(user["_id"]) }, { "$set": { "library": current_user["library"] }})
        else: 
            return HttpResponse(json.dumps({ "msg": "please logout and login again" }))

        if not exists:
            tmpName = int(time.mktime(datetime.datetime.now().timetuple()))

            open(f"{save_path}{tmpName}", "wb").write(byteData)

            subprocess.run(["ffmpeg", "-i", f"{save_path}{tmpName}", "-ab", "1000k", "-vn", f"{save_path}{tmpName}.wav"])
            os.remove(f"{save_path}{tmpName}")
            amps = genWave.getWave(f"{save_path}{tmpName}.wav")

            file_collection.insert_one({ "file_name": tmpName, "file_hash": fileHash, "amps": amps, "alternate_names": [original_file_name] })
        else:
            alt_names = exists["alternate_names"]
            alt_names.append(original_file_name)
            file_collection.update_one({ "file_hash": fileHash }, { "$set": { "alternate_names": list(set(alt_names)) } })
            tmpName = exists["file_name"]
            amps = exists["amps"]

        return HttpResponse(json.dumps({ "amps": amps, "fileName": f"{tmpName}.wav" }), content_type = "application/json")

    else:
        return HttpResponse("Nothing to see here ;)")