from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.route_auth import router as auth_router
from apps.route_notes import router as notes_router

app = FastAPI()

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    notes_router,
    prefix="/notes",
    tags=["notes"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
