from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import insert_user, get_user_by_email, get_user, update_user, delete_user, log_user_login  # Import update_login_time

router = APIRouter()

# Pydantic model for user creation
class UserCreate(BaseModel):
    username: str
    password: str  # Plain password
    email: str

# Pydantic model for user update
class UserUpdate(BaseModel):
    username: Optional[str]
    password: Optional[str]  # Plain password
    email: Optional[str]

# Pydantic model for user response
class User(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

# Pydantic model for login
class UserLogin(BaseModel):
    email: str
    password: str  # Plain password for login validation
    login_time: Optional[str] = None  # Add login_time to track when user logs in

# Endpoint to create a new user
@router.post("/create", response_model=User)
async def create_user(user: UserCreate):
    # Check if the email already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Insert the new user into the database
    result = await insert_user(user.username, user.password, user.email)
    if result is None:
        raise HTTPException(status_code=400, detail="Error creating user")
    return result

# Endpoint to get a user by user_id
@router.get("/{user_id}", response_model=User)
async def read_user(user_id: int):
    result = await get_user(user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result

# Endpoint to update a user
@router.put("/{user_id}", response_model=User)
async def update_user_endpoint(user_id: int, user: UserUpdate):
    # Update the user details
    result = await update_user(user_id, user.username, user.password, user.email)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result

# Endpoint to delete a user
@router.delete("/{user_id}")
async def delete_user_endpoint(user_id: int):
    result = await delete_user(user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

# Endpoint for user login

@router.post("/login")
async def login_user(user: UserLogin):
    db_user = await get_user_by_email(user.email)
    if db_user is None:
        # Log the failed login attempt
        await log_user_login(None, "Failure")  # You can log without a user_id in case of failure
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify the plain password
    if user.password != db_user["password"]:
        await log_user_login(db_user["user_id"], "Failure")
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Successful login
    await log_user_login(db_user["user_id"], "Success")

    # Return user info (excluding the password)
    return {
        "user_id": db_user["user_id"],
        "username": db_user["username"],
        "email": db_user["email"],
        "created_at": db_user["created_at"],
    }
