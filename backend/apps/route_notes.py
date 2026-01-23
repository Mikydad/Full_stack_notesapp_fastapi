from apps.deps import get_current_user
from apps.database import note_collection
from apps.models import CreateNote, NoteOut
from apps.deps import get_current_user, require_role
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

router = APIRouter()

def serialize_note(note):
    """Serialize MongoDB note document to NoteOut format"""
    return {
        "id": str(note["_id"]),
        "note_title": note["note_title"],
        "note_desc": note["note_desc"],
        "category_id": str(note.get("category_id", "")) if note.get("category_id") else None
    }

@router.get("/notes", response_model=list[NoteOut])
def get_notes(user: dict = Depends(get_current_user)):
    """Get all notes for the current user"""
    # Filter notes by user email
    result = note_collection.find({"user_email": user["username"]})
    return [serialize_note(note) for note in result]

@router.get("/notes/category/{category_id}", response_model=list[NoteOut])
def get_notes_by_category(category_id: str, user: dict = Depends(get_current_user)):
    """Get all notes for a specific category"""
    # Convert category_id to ObjectId for querying
    # Filter by both category_id and user_email for security
    try:
        category_object_id = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid category ID format")
    
    result = note_collection.find({
        "category_id": category_object_id,
        "user_email": user["username"]
    })
    return [serialize_note(note) for note in result]

@router.post("/notes", response_model=NoteOut)
def create_note(note: CreateNote, user: dict = Depends(get_current_user)):
    """Create a new note"""
    # Validate category exists if provided
    if note.category_id:
        from apps.database import category_collection
        category = category_collection.find_one({
            "_id": ObjectId(note.category_id),
            "user_email": user["username"]
        })
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    note_data = note.dict()
    note_data["user_email"] = user["username"]  # Associate note with user
    # Convert category_id to ObjectId if provided
    if note.category_id:
        note_data["category_id"] = ObjectId(note.category_id)
    
    result = note_collection.insert_one(note_data)
    created_note = note_collection.find_one({"_id": result.inserted_id})
    return serialize_note(created_note)

@router.put("/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: str, note: CreateNote, user: dict = Depends(get_current_user)):
    """Update an existing note"""
    # Verify note belongs to user
    existing_note = note_collection.find_one({
        "_id": ObjectId(note_id),
        "user_email": user["username"]
    })
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Validate category if provided
    if note.category_id:
        from apps.database import category_collection
        category = category_collection.find_one({
            "_id": ObjectId(note.category_id),
            "user_email": user["username"]
        })
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Prepare update data with category_id as ObjectId if provided
    update_data = note.dict()
    if note.category_id:
        update_data["category_id"] = ObjectId(note.category_id)
    
    note_collection.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_data}
    )
    updated_note = note_collection.find_one({"_id": ObjectId(note_id)})
    return serialize_note(updated_note)

@router.delete("/notes/{note_id}")
def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    """Delete a note"""
    result = note_collection.delete_one({
        "_id": ObjectId(note_id),
        "user_email": user["username"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

@router.delete("/admin-only")
def delete_all_notes(user=Depends(require_role("admin"))):
    return {"message": "Admin action performed"}

    