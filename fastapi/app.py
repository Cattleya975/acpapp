from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from database import database, connect_db, disconnect_db, insert_attendance, get_attendance_by_date
from datetime import datetime
from routes.users import router as users_router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow from any origin for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events to connect and disconnect from the database
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# -----------------------------------------------
# Pydantic models for validation
# -----------------------------------------------

# Employee-related models
class EmployeeCreate(BaseModel):
    name: str
    department: str
    role: str

class Employee(BaseModel):
    employee_id: int
    name: str
    department: str
    role: str

class AttendanceRecord(BaseModel):
    employee_id: int
    name: str
    department: str
    status: str
    date: str

# -----------------------------------------------
# Employee Router
# -----------------------------------------------

employee_router = APIRouter()
attendance_router = APIRouter()

# Get all employees
@employee_router.get("", response_model=List[Employee])
async def get_employees():
    query = "SELECT * FROM employees"
    employees = await database.fetch_all(query=query)
    return employees

# Add a new employee
@employee_router.post("", response_model=Employee)
async def add_employee(employee: EmployeeCreate):
    query = """
    INSERT INTO employees (name, department, role)
    VALUES (:name, :department, :role)
    RETURNING employee_id, name, department, role
    """
    values = {"name": employee.name, "department": employee.department, "role": employee.role}
    new_employee = await database.fetch_one(query=query, values=values)
    if new_employee is None:
        raise HTTPException(status_code=500, detail="Failed to add employee")
    return new_employee

# Delete an employee
@employee_router.delete("/{employee_id}", response_model=dict)
async def remove_employee(employee_id: int):
    query = "DELETE FROM employees WHERE employee_id = :employee_id RETURNING employee_id"
    result = await database.fetch_one(query=query, values={"employee_id": employee_id})
    if result is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"detail": f"Employee {employee_id} deleted successfully"}

# -----------------------------------------------
# Attendance Router
# -----------------------------------------------

# Record attendance data
# Update individual attendance record (Present or Absent)
@attendance_router.post("/update", response_model=dict)
async def update_attendance_record(attendance: AttendanceRecord):
    try:
        # Log the incoming request data
        print(f"Received attendance update request: {attendance}")

        # If status is "Present", append the current time
        if attendance.status == "Present":
            current_time = datetime.now().strftime("%I:%M:%S %p")
            attendance.status = f"Present at {current_time}"

        # Log before attempting to insert or update attendance
        print(f"Inserting/updating attendance for {attendance.employee_id} on {attendance.date} with status {attendance.status}")

        # Use the insert_attendance function to insert or update the record
        await insert_attendance(
            employee_id=attendance.employee_id,
            name=attendance.name,
            department=attendance.department,
            status=attendance.status,
            date=attendance.date
        )

        return {"message": "Attendance updated successfully"}
    except Exception as e:
        print(f"Error occurred while updating attendance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update attendance: {str(e)}")


# Update individual attendance record (Present or Absent)
# Record or update attendance data
@attendance_router.post("/update", response_model=dict)
async def update_attendance_record(attendance: AttendanceRecord):
    try:
        # Log the incoming request data
        print(f"Received attendance update request: {attendance}")

        # If status is "Present", append the current time
        if attendance.status == "Present":
            current_time = datetime.now().strftime("%I:%M:%S %p")
            attendance.status = f"Present at {current_time}"

        # Log before attempting to insert or update attendance
        print(f"Inserting/updating attendance for {attendance.employee_id} on {attendance.date} with status {attendance.status}")

        # Use the insert_attendance function to insert or update the record
        await insert_attendance(
            employee_id=attendance.employee_id,
            name=attendance.name,
            department=attendance.department,
            status=attendance.status,
            date=attendance.date
        )

        return {"message": "Attendance updated successfully"}
    except Exception as e:
        print(f"Error occurred while updating attendance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update attendance: {str(e)}")

# Get attendance data by date
@attendance_router.get("/by-date", response_model=List[AttendanceRecord])
async def get_attendance_by_date(date: str):
    try:
        attendance = await get_attendance_by_date(date)
        if not attendance:
            raise HTTPException(status_code=404, detail="No attendance records found for the selected date")
        return attendance
    except Exception as e:
        print(f"Error occurred while fetching attendance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch attendance")

# -----------------------------------------------
# Include Routers in the FastAPI application
# -----------------------------------------------

app.include_router(employee_router, prefix="/api/employees")
app.include_router(attendance_router, prefix="/api/attendance")
app.include_router(users_router, prefix="/api/users")
