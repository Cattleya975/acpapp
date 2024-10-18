from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from database import database, connect_db, disconnect_db, insert_attendance, get_attendance_by_date, insert_or_update_working_hour, get_all_working_hours as fetch_working_hours
from datetime import datetime, date
from routes.users import router as users_router
from typing import Optional 
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

class WorkingHourCreate(BaseModel):
    employee_id: int
    name: str
    time_in: Optional[str]  # Can be None if the employee is absent
    timeliness: str
    date: str

class WorkingHourResponse(BaseModel):
    employee_id: int
    name: str
    time_in: Optional[str]
    timeliness: str

employee_router = APIRouter()
attendance_router = APIRouter()
working_hour_router = APIRouter()
attendance_summary_router = APIRouter()

# -----------------------------------------------
# Employee Router
# -----------------------------------------------

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
@attendance_router.post("/update", response_model=dict)
async def update_attendance_record(attendance: AttendanceRecord):
    try:
        logger.info(f"Received attendance update request: {attendance}")

        # If status is "Present", append the current time
        if attendance.status.startswith("Present"):
            current_time = datetime.now().strftime("%I:%M:%S %p")
            attendance.status = f"Present at {current_time}"

        logger.info(f"Inserting/updating attendance for {attendance.employee_id} on {attendance.date} with status {attendance.status}")

        # Insert or update attendance
        await insert_attendance(
            employee_id=attendance.employee_id,
            name=attendance.name,
            department=attendance.department,
            status=attendance.status,
            date=attendance.date
        )

        # Determine time_in and timeliness
        time_in = current_time if attendance.status.startswith("Present") else None
        timeliness = "On Time"

        # Mark "Late" if time_in is after 9:01 AM
        if time_in and datetime.strptime(time_in, "%I:%M:%S %p") > datetime.strptime("09:01:00 AM", "%I:%M:%S %p"):
            timeliness = "Late"

        # Insert or update working hour record
        await insert_or_update_working_hour(
            employee_id=attendance.employee_id,
            name=attendance.name,
            time_in=time_in,
            timeliness=timeliness,
            date=attendance.date
        )

        return {"message": "Attendance and working hour updated successfully"}
    except Exception as e:
        logger.error(f"Error occurred while updating attendance: {str(e)}")
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
        logger.error(f"Error occurred while fetching attendance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch attendance")

@attendance_router.get("/all", response_model=List[AttendanceRecord])
async def fetch_all_attendance():
    try:
        logger.info("Fetching all attendance records...")
        query = "SELECT * FROM attendance"
        attendance_records = await database.fetch_all(query=query)

        # Convert each record into a dictionary and modify it
        attendance_list = []
        for record in attendance_records:
            # Convert the Record object to a dictionary
            record_dict = dict(record)
            
            # Convert the 'date' field to a string (format YYYY-MM-DD)
            if "date" in record_dict and record_dict["date"]:
                record_dict["date"] = record_dict["date"].strftime("%Y-%m-%d")
            
            attendance_list.append(record_dict)

        if not attendance_list:
            logger.info("No attendance records found")
            raise HTTPException(status_code=404, detail="No attendance records found")
        
        return attendance_list

    except Exception as e:
        logger.error(f"Error occurred while fetching attendance records: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch attendance records")

        
# -----------------------------------------------
# Working Hours Router
# -----------------------------------------------

@working_hour_router.get("/all", response_model=List[WorkingHourResponse])
async def fetch_all_working_hours():
    try:
        logger.info("Fetching all working hours...")
        working_hours_records = await fetch_working_hours()

        if not working_hours_records:
            logger.info("No working hour records found")
            raise HTTPException(status_code=404, detail="No working hour records found")

        # Convert the date field to a string (format YYYY-MM-DD)
        for record in working_hours_records:
            if "date" in record and record["date"]:
                record["date"] = record["date"].strftime("%Y-%m-%d")

        return working_hours_records

    except Exception as e:
        logger.error(f"Error occurred while fetching working hours: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch working hour records")

# Update working hour data based on attendance
@working_hour_router.post("/update", response_model=dict)
async def update_working_hour(attendance: AttendanceRecord):
    try:
        logger.info(f"Updating working hour record for employee {attendance.employee_id} on {attendance.date}")

        # Determine time_in and timeliness
        current_time = datetime.now().strftime("%I:%M:%S %p") if attendance.status.startswith("Present") else None
        timeliness = "On Time" if current_time and current_time <= "09:01:00 AM" else "Late"

        # Insert or update working hour record
        await insert_or_update_working_hour(
            employee_id=attendance.employee_id,
            name=attendance.name,
            time_in=current_time,
            timeliness=timeliness,
            date=attendance.date
        )

        return {"message": "Working hour updated successfully"}
    except Exception as e:
        logger.error(f"Error occurred while updating working hour: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update working hour: {str(e)}")

# -----------------------------------------------
# Dashboard Router
# -----------------------------------------------

@attendance_summary_router.get("/today-summary")
async def get_today_attendance_summary():
    try:
        # Convert today's date string to a datetime.date object
        today = date.today()
        logger.info(f"Fetching attendance summary for {today}")

        # Query for the summary of attendance data
        query = """
        SELECT 
            COUNT(*) AS total_employees,
            COUNT(CASE WHEN status LIKE 'Present%' THEN 1 END) AS present,
            COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent
        FROM attendance
        WHERE date = :today
        """
        result = await database.fetch_one(query=query, values={"today": today})
        logger.info(f"Query Result: {result}")

        if not result:
            logger.error("No attendance records found for today")
            raise HTTPException(status_code=404, detail="No attendance records found for today")

        return {
            "totalEmployees": result["total_employees"],
            "present": result["present"],
            "absent": result["absent"],
        }

    except Exception as e:
        logger.error(f"Failed to fetch today's attendance summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch today's attendance summary: {str(e)}")

# -----------------------------------------------
# Include Routers in the FastAPI application
# -----------------------------------------------

app.include_router(employee_router, prefix="/api/employees")
app.include_router(attendance_router, prefix="/api/attendance")
app.include_router(users_router, prefix="/api/users")
app.include_router(working_hour_router, prefix="/api/working-hours")
app.include_router(attendance_summary_router, prefix="/api/attendance")