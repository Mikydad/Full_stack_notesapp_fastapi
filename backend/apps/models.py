from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    email: EmailStr
    password: str

class LoginUser(BaseModel):
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