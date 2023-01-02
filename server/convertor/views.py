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

# Create your views here.
os.makedirs("../client/src/uploads", exist_ok = True)
open("../client/src/uploads/current.wav", "w").write("")

@csrf_exempt
def index(request):
    amps = [0]
    if request.method == "POST":
        data = request.body
        tmpName = int(time.mktime(datetime.datetime.now().timetuple()))

        os.makedirs("./uploads", exist_ok = True)

        open(f"./uploads/{tmpName}", "wb").write(base64.b64decode(b",".join(data[1:-1].split(b',')[1:])))

        subprocess.run(["ffmpeg", "-i", f"./uploads/{tmpName}", "-ab", "1000k", "-vn", f"./uploads/{tmpName}.wav"])
        shutil.copyfile(f"./uploads/{tmpName}.wav", "../client/src/uploads/current.wav")
        os.remove(f"./uploads/{tmpName}")
        amps = genWave.getWave(f"./uploads/{tmpName}.wav")

        return HttpResponse(json.dumps({ "amps": amps, "fileName": f"{tmpName}.wav" }), content_type = "application/json")

    else:
        return HttpResponse("Nothing to see here ;)")