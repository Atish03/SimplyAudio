from pymongo import MongoClient
import bcrypt
import time
import jwt
import json

client = MongoClient( host = "mongo", port = 27017 )
db_handle = client['simplyaudio']
users = db_handle["users"]

secret = "Sup3r_s3cret"

def getSession(data):
    data["_id"] = str(data["_id"])
    del data["password"]
    token = jwt.encode(
        payload = data,
        key = secret
    )
    return token

def addUser(user):
    username = user["username"]
    hashed_password = bcrypt.hashpw(user["password"].encode(), bcrypt.gensalt())
    users.insert_one({ "username": username, "password": hashed_password.decode(), "added_on": time.time(), "library": {} })
    return getSession(users.find_one({ "username": username }))

def verifyUser(user):
    username = user["username"]
    password = user["password"]
    hashed_password = users.find_one({ "username": username })["password"]
    if bcrypt.checkpw(password.encode(), hashed_password.encode()):
        return getSession(users.find_one({ "username": username }))
    else: return False

def userExists(user):
    username = user["username"]
    user = users.find_one({ "username": username })
    return user

def verifyToken(token):
    try:
        return jwt.decode(token, key = secret, algorithms = ["HS256"])
    except:
        return False