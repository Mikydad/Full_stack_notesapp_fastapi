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
        "password": hash_password(user.password)
    })

    return {"message:": "User Created"}


@router.post("/login")
def login_user(user: LoginUser):
    db_user = user_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# @router.post("/login")
# def login_user(user: LoginUser):
#     db_user = user_collection.find_one({"email": user.email})

#     if not db_user or not verify_password(user.password, db_user["password"]):
#         raise HTTPException(401, "Invalid credentials")
    
    