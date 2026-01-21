from pydantic import BaseModel, EmailStr
from typing import Optional

class CreateUser(BaseModel):
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class CreateNote(BaseModel):
    note_title: str
    note_desc: str
    category_id: Optional[str] = None  # Optional - note can exist without category
    
class NoteOut(BaseModel):
    id: str
    note_title: str
    note_desc: str
    category_id: Optional[str] = None

class CreateCategory(BaseModel):
    name: str  # Changed from category_title to name for consistency

class UpdateCategory(BaseModel):
    name: str

class CategoryOut(BaseModel):
    id: str
    name: str
