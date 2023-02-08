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

# Create your views here.

client = MongoClient( host = "localhost", port = 27017 )

db_handle = client['simplyaudio']
file_collection = db_handle["files"]

save_path = "../streamer/uploads/"

@csrf_exempt
def index(request):
    amps = [0]
    if request.method == "POST":
        data = request.body
        os.makedirs(save_path, exist_ok = True)

        byteData = base64.b64decode(b",".join(data[1:-1].split(b',')[1:]))
        fileHash = hashlib.md5(byteData).hexdigest()

        exists = file_collection.find_one({ "file_hash": fileHash })

        if not exists:
            tmpName = int(time.mktime(datetime.datetime.now().timetuple()))

            open(f"{save_path}{tmpName}", "wb").write(byteData)

            subprocess.run(["ffmpeg", "-i", f"{save_path}{tmpName}", "-ab", "1000k", "-vn", f"{save_path}{tmpName}.wav"])
            os.remove(f"{save_path}{tmpName}")
            amps = genWave.getWave(f"{save_path}{tmpName}.wav")

            file_collection.insert_one({ "file_name": tmpName, "file_hash": fileHash, "amps": amps })
        else:
            tmpName = exists["file_name"]
            amps = exists["amps"]

        return HttpResponse(json.dumps({ "amps": amps, "fileName": f"{tmpName}.wav" }), content_type = "application/json")

    else:
        return HttpResponse("Nothing to see here ;)")