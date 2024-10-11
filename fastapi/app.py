from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Optional, constr
from typing import List
from datetime import datetime
from database import connect_db, disconnect_db, database  # Ensure your database functions are imported

app = FastAPI()

# CORS configuration (modify origins as required)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for User
class UserCreate(BaseModel):
    username: str
    password_hash: str
    email: str

class UserUpdate(BaseModel):
    username: Optional[str]
    password_hash: Optional[str]
    email: Optional[str]

class User(BaseModel):
    user_id: int
    username: str
    password_hash: str
    email: str
    created_at: datetime

class UserLogin(BaseModel):
    email: str
    password_hash: str

# Pydantic models for Employee
class TimeString(str):  # Alternatively, you can use str directly with regex validation 
    @classmethod
    @property
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if not isinstance(value, str):
            raise TypeError('must be a string')
        if not constr(regex=r'^\d{2}:\d{2}$').validate(value):
            raise ValueError('must be in HH:MM format')
        return value

class EmployeeCreate(BaseModel):
    name: str
    department: str
    role: str
    start_time: TimeString
    end_time: TimeString

class Employee(EmployeeCreate):
    id: int

# User endpoints
@app.post("/users/create", response_model=User)
async def create_user(user: UserCreate):
    existing_user = await get_user(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    result = await insert_user(user.username, user.password_hash, user.email)
    if result is None:
        raise HTTPException(status_code=400, detail="Error creating user")
    return result

@app.get("/users/{user_id}", response_model=User)
async def read_user(user_id: int):
    result = await get_user(user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: UserUpdate):
    result = await update_user(user_id, user.username, user.password_hash, user.email)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    result = await delete_user(user_id)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

@app.post("/users/login")
async def login_user(user: UserLogin):
    db_user = await get_user_by_email(user.email, user.password_hash)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": db_user.user_id,
        "username": db_user.username,
        "email": db_user.email,
        "created_at": db_user.created_at
    }

# Employee endpoints
@app.get("/employees", response_model=List[Employee])
async def get_employees():
    query = "SELECT * FROM employees"
    return await database.fetch_all(query)

@app.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate):
    query = """
        INSERT INTO employees (name, department, role, start_time, end_time)
                VALUES (:name, :department, :role, :start_time, :end_time)
        RETURNING id, name, department, role, start_time, end_time
    """
    employee_record = await database.fetch_one(query, values=employee.dict())
    if employee_record:
        return Employee(**employee_record)

    raise HTTPException(status_code=400, detail="Error creating employee")

@app.delete("/employees/{id}")
async def delete_employee(id: int):
    query = "DELETE FROM employees WHERE id = :id RETURNING *"
    result = await database.fetch_one(query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

@app.put("/employees/{id}", response_model=Employee)
async def update_employee(id: int, employee: EmployeeCreate):
    query = """
        UPDATE employees
        SET name = :name, department = :department, role = :role, start_time = :start_time, end_time = :end_time
        WHERE id = :id
        RETURNING id, name, department, role, start_time, end_time
    """
    updated_employee = await database.fetch_one(query, values={**employee.dict(), "id": id})
    if not updated_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return Employee(**updated_employee)

@app.on_event("startup")
async def startup():
    await connect_db()  # Connect to the database on startup

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()  # Disconnect from the database on shutdown

