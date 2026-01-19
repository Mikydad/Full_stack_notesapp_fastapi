from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from apps.deps import get_current_user
from apps.models import CreateUser, LoginUser
from apps.database import user_collection
from apps.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def create_user(user: CreateUser):
    if user_collection.find_one({"email" : user.email}):
        raise HTTPException(400, "Email already exists")

    user_collection.insert_one({
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user"
    })

    return {"message:": "User Created"}


@router.post("/login")
def login_user(user: LoginUser):
    db_user = user_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Get role from database, default to "user" if not present
    user_role = db_user.get("role", "user")

    access_token = create_access_token(
        data={"sub": user.email, "role": user_role},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user_role}

# @router.post("/login")
# def login_user(user: LoginUser):

    