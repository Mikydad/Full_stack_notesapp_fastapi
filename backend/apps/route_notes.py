from apps.deps import get_current_user
from apps.database import note_collection
from apps.models import CreateNote, NoteOut
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

def serilize_note(note):
    return {
        "id": str(note["_id"]),
        "note_title": note["note_title"],
        "note_desc": note["note_desc"]
    }

@router.get("/notes", response_model=list[CreateNote])
def get_todos(user: str = Depends(get_current_user)):
    result = note_collection.find()
    return [serilize_note(note) for note in result]

@router.post("/notes", response_model=NoteOut)
def create_notes(note: CreateNote, user: str = Depends(get_current_user) ):
    result = note_collection.insert_one(note.dict())

    return {
        "id": str(result.inserted_id),
        "note_title": note.note_title,
        "note_desc": note.note_desc,
    }