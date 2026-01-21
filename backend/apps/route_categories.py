from apps.deps import get_current_user
from apps.database import category_collection, note_collection
from apps.models import CreateCategory, UpdateCategory, CategoryOut
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

router = APIRouter()

def serialize_category(category):
    """Serialize MongoDB category document to CategoryOut format"""
    return {
        "id": str(category["_id"]),
        "name": category["name"]
    }

@router.get("/categories", response_model=list[CategoryOut])
def get_categories(user: dict = Depends(get_current_user)):
    """Get all categories for the current user"""
    result = category_collection.find({"user_email": user["username"]})
    return [serialize_category(cat) for cat in result]

@router.post("/categories", response_model=CategoryOut)
def create_category(category: CreateCategory, user: dict = Depends(get_current_user)):
    """Create a new category"""
    # Check if category with same name already exists for this user
    existing = category_collection.find_one({
        "name": category.name,
        "user_email": user["username"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    category_data = category.dict()
    category_data["user_email"] = user["username"]  # Associate category with user
    
    result = category_collection.insert_one(category_data)
    created_category = category_collection.find_one({"_id": result.inserted_id})
    return serialize_category(created_category)

@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: str, category: UpdateCategory, user: dict = Depends(get_current_user)):
    """Update an existing category"""
    # Verify category belongs to user
    existing_category = category_collection.find_one({
        "_id": ObjectId(category_id),
        "user_email": user["username"]
    })
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name conflicts with another category
    conflicting = category_collection.find_one({
        "name": category.name,
        "user_email": user["username"],
        "_id": {"$ne": ObjectId(category_id)}  # Exclude current category
    })
    if conflicting:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    category_collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": {"name": category.name}}
    )
    updated_category = category_collection.find_one({"_id": ObjectId(category_id)})
    return serialize_category(updated_category)

@router.delete("/categories/{category_id}")
def delete_category(category_id: str, user: dict = Depends(get_current_user)):
    """Delete a category"""
    # Verify category belongs to user
    existing_category = category_collection.find_one({
        "_id": ObjectId(category_id),
        "user_email": user["username"]
    })
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if any notes are using this category
    notes_count = note_collection.count_documents({
        "category_id": category_id,
        "user_email": user["username"]
    })
    if notes_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category: {notes_count} note(s) are using it. Please remove notes first or change their category."
        )
    
    result = category_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

