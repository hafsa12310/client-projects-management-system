import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is missing. Put it in api/.env")

# fail fast instead of hanging requests when the DB is unreachable
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
db = client["project_portal"]
