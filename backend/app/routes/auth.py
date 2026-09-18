from fastapi import APIRouter

from backend.app.database.mongodb import db
from backend.app.models.user import create_user_document
from backend.app.schemas.user import UserCreate, UserLogin
from backend.app.services.auth_service import hash_password, verify_password
from backend.app.services.jwt_service import create_access_token


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(user: UserCreate):
    existing_user = db.users.find_one(
        {"email": user.email.lower().strip()}
    )

    if existing_user:
        return {
            "message": "User already exists"
        }

    password_hash = hash_password(user.password)

    user_document = create_user_document(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
    )

    result = db.users.insert_one(user_document)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


@router.post("/login")
def login(user: UserLogin):
    existing_user = db.users.find_one(
        {"email": user.email.lower().strip()}
    )

    if not existing_user:
        return {
            "message": "Invalid email or password"
        }

    password_valid = verify_password(
        user.password,
        existing_user["password_hash"],
    )

    if not password_valid:
        return {
            "message": "Invalid email or password"
        }

    access_token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"],
        },
    }