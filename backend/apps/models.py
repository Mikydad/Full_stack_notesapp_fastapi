from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    user_id: str
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    user_id: str
    email: EmailStr
    password: str

class CreateNote(BaseModel):
    id: str
    note_title: str
    note_desc: str
    
class NoteOut(BaseModel):
    id: str
    note_title: str
    note_desc: str