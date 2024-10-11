from typing import Union, List
from fastapi import FastAPI, HTTPException, Depends, Query, Path
from pydantic import BaseModel, conint
from database import insert_employee, get_employees, update_employee, delete_employee, connect_db, disconnect_db
from routes.users import router
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
import logging

# Initialize the FastAPI application
app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Allow CORS for the frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include user-related routes
app.include_router(router, prefix="/api")

# Database connection events
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# Define the Employee data model
class Employee(BaseModel):
    name: str
    department: str
    role: str
    start_time: str
    end_time: str

# Get the list of employees from the database
@app.get("/employees", response_model=List[Employee])
async def get_employees_list():
    employees = await get_employees()
    if not employees:
        logger.info("No employees found")
        return []  # Return an empty list if no employees are found
    return employees

# Add a new employee to the database
@app.post("/employees", response_model=Employee)
async def add_employee_to_db(employee: Employee):
    new_employee = await insert_employee(
        name=employee.name,
        department=employee.department,
        role=employee.role,
        start_time=employee.start_time,
        end_time=employee.end_time
    )
    if new_employee:
        logger.info(f"Added new employee: {new_employee}")
    else:
        raise HTTPException(status_code=400, detail="Failed to add employee")
    return new_employee

# Update an existing employee in the database
@app.put("/employees/{employee_id}", response_model=Employee)
async def update_employee_in_db(
    employee_id: int, employee: Employee
):
    updated_employee = await update_employee(
        employee_id=employee_id,
        name=employee.name,
        department=employee.department,
        role=employee.role,
        start_time=employee.start_time,
        end_time=employee.end_time
    )
    if updated_employee:
        logger.info(f"Updated employee: {updated_employee}")
    else:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated_employee

# Delete an employee from the database
@app.delete("/employees/{employee_id}")
async def delete_employee_from_db(employee_id: int):
    deleted_employee = await delete_employee(employee_id)
    if deleted_employee:
        logger.info(f"Deleted employee: {deleted_employee}")
    else:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": f"Employee {employee_id} deleted."}

# Clear the employee list from the database (if needed)
@app.delete("/employees")
async def clear_employees_from_db():
    employees = await get_employees()
    if employees:
        for employee in employees:
            await delete_employee(employee['employee_id'])
        logger.info("Cleared employee list.")
        return {"message": "Employee list cleared."}
    else:
        raise HTTPException(status_code=404, detail="No employees to clear")

# Error handling for HTTP exceptions
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP Exception: {exc.detail} - {request.method} {request.url}")
    return await request.app.exception_handler(exc)

# Custom logging on all requests (optional)
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
