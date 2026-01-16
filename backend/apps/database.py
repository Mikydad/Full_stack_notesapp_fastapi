from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["db"]

#create a collection for user and note.
user_collection = db["user_collection"]

note_collection = db["note_collection"]