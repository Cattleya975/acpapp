from databases import Database
from typing import Optional  # Import Optional for optional parameters
from datetime import datetime
import logging
from fastapi import logger

# Configure logger
logger = logging.getLogger("app_logger")
logging.basicConfig(level=logging.INFO)

# Database connection details
POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'

database = Database(DATABASE_URL)

# ----------------------------------------------
# Database Connection and Disconnection
# ----------------------------------------------

async def connect_db():
    await database.connect()

async def disconnect_db():
    await database.disconnect()

# ----------------------------------------------
# User Functions (Using Plain Passwords)
# ----------------------------------------------

# Log user login activity
async def log_user_login(user_id: int, status: str):
    query = """
    INSERT INTO login (user_id, login_time, status)
    VALUES (:user_id, NOW(), :status)
    """
    values = {"user_id": user_id, "status": status}
    await database.execute(query=query, values=values)



# Insert user into the database with plain password
async def insert_user(username: str, password: str, email: str):
    query = """
    INSERT INTO users (username, password, email)
    VALUES (:username, :password, :email)
    RETURNING user_id, username, password, email, created_at
    """
    values = {"username": username, "password": password, "email": email}
    return await database.fetch_one(query=query, values=values)

# Get user by username
async def get_user(username: str):
    query = "SELECT * FROM users WHERE username = :username"
    return await database.fetch_one(query=query, values={"username": username})

# Get user by email
async def get_user_by_email(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    return await database.fetch_one(query=query, values={"email": email})

# Update user details (using plain password)
async def update_user(user_id: int, username: Optional[str], password: Optional[str], email: Optional[str]):
    query = """
    UPDATE users
    SET username = COALESCE(:username, username),
        password = COALESCE(:password, password),
        email = COALESCE(:email, email)
    WHERE user_id = :user_id
    RETURNING user_id, username, password, email, created_at
    """
    values = {"user_id": user_id, "username": username, "password": password, "email": email}
    return await database.fetch_one(query=query, values=values)

# Delete user by user_id
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING user_id"
    return await database.execute(query=query, values={"user_id": user_id})

# ----------------------------------------------
# Employee Functions
# ----------------------------------------------

# Insert a new employee into the employees table
async def insert_employee(name: str, department: str, role: str):
    query = """
    INSERT INTO employees (name, department, role)
    VALUES (:name, :department, :role)
    RETURNING employee_id, name, department, role
    """
    values = {"name": name, "department": department, "role": role}
    return await database.fetch_one(query=query, values=values)

# Get an employee by employee_id
async def get_employee(employee_id: int):
    query = "SELECT * FROM employees WHERE employee_id = :employee_id"
    return await database.fetch_one(query=query, values={"employee_id": employee_id})

# Update an employee's details in the employees table
async def update_employee(employee_id: int, name: str, department: str, role: str):
    query = """
    UPDATE employees
    SET name = :name, department = :department, role = :role
    WHERE employee_id = :employee_id
    RETURNING employee_id, name, department, role
    """
    values = {"employee_id": employee_id, "name": name, "department": department, "role": role}
    return await database.fetch_one(query=query, values=values)

# Delete an employee by employee_id
async def delete_employee(employee_id: int):
    query = "DELETE FROM employees WHERE employee_id = :employee_id RETURNING *"
    return await database.fetch_one(query=query, values={"employee_id": employee_id})

# ----------------------------------------------
# Attendance Functions
# ----------------------------------------------

# Insert attendance record into the attendance table
async def insert_attendance(employee_id: int, name: str, department: str, status: str, date: str):
    print(f"Inserting attendance for employee_id {employee_id}, date {date}")  # Debug print
    
    # Convert the date string to a datetime.date object
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
        print(f"Parsed date: {parsed_date}")  # Debug print to confirm conversion
    except ValueError as e:
        raise ValueError(f"Invalid date format: {date}. Expected format is YYYY-MM-DD. Error: {e}")
    
    query = """
    INSERT INTO attendance (employee_id, name, department, status, date)
    VALUES (:employee_id, :name, :department, :status, :date)
    ON CONFLICT (employee_id, date) 
    DO UPDATE SET 
        status = EXCLUDED.status, 
        name = EXCLUDED.name, 
        department = EXCLUDED.department
    """
    values = {"employee_id": employee_id, "name": name, "department": department, "status": status, "date": parsed_date}
    return await database.execute(query=query, values=values)

# Get all attendance records for a specific date
async def get_attendance_by_date(date: str):
    logger.info(f"Fetching attendance for date {date}")
    try:
        query = "SELECT * FROM attendance WHERE date = :date"
        attendance_records = await database.fetch_all(query=query, values={"date": date})

        # Check if any records are returned
        if not attendance_records:
            logger.info(f"No attendance records found for {date}")
            return []

        logger.info(f"Attendance records fetched successfully for {date}")
        return attendance_records

    except Exception as e:
        logger.error(f"Error occurred while fetching attendance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch attendance")



# ----------------------------------------------
# Working Hours Functions
# ----------------------------------------------

async def insert_or_update_working_hour(employee_id: int, name: str, time_in: Optional[str], timeliness: str, date: str):
    try:
        logger.info(f"Inserting or updating working hour for employee_id {employee_id} on date {date}")

        # Convert the date string to a datetime.date object
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()

        # Convert the time_in string (if available) to a datetime.time object
        if time_in:
            parsed_time_in = datetime.strptime(time_in, "%I:%M:%S %p").time()
        else:
            parsed_time_in = None

        query = """
        INSERT INTO working_hours (employee_id, name, time_in, timeliness, date)
        VALUES (:employee_id, :name, :time_in, :timeliness, :date)
        ON CONFLICT (employee_id, date) 
        DO UPDATE SET 
            time_in = EXCLUDED.time_in,
            timeliness = EXCLUDED.timeliness
        """
        values = {
            "employee_id": employee_id,
            "name": name,
            "time_in": parsed_time_in,  # Pass the parsed time_in
            "timeliness": timeliness,
            "date": parsed_date  # Pass the parsed date
        }
        await database.execute(query=query, values=values)
        logger.info("Working hour record inserted or updated successfully")
    except Exception as e:
        logger.error(f"Error inserting or updating working hour: {str(e)}")
        raise e

# Fetch all working hour records
async def insert_or_update_working_hour(employee_id: int, name: str, time_in: Optional[str], timeliness: str, date: str):
    try:
        logger.info(f"Inserting or updating working hour for employee_id {employee_id} on date {date}")

        # Convert the date string to a datetime.date object
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()

        # Convert the time_in string (if available) to a datetime.time object
        if time_in:
            parsed_time_in = datetime.strptime(time_in, "%I:%M:%S %p").time()
        else:
            parsed_time_in = None

        query = """
        INSERT INTO working_hours (employee_id, name, time_in, timeliness, date)
        VALUES (:employee_id, :name, :time_in, :timeliness, :date)
        ON CONFLICT (employee_id, date) 
        DO UPDATE SET 
            time_in = EXCLUDED.time_in,
            timeliness = EXCLUDED.timeliness
        """
        values = {
            "employee_id": employee_id,
            "name": name,
            "time_in": parsed_time_in,  # Pass the parsed time_in
            "timeliness": timeliness,
            "date": parsed_date  # Pass the parsed date
        }
        await database.execute(query=query, values=values)
        logger.info("Working hour record inserted or updated successfully")
    except Exception as e:
        logger.error(f"Error inserting or updating working hour: {str(e)}")
        raise e

# Fetch all working hour records
async def get_all_working_hours():
    try:
        query = """
        SELECT employee_id, name, time_in, timeliness, date 
        FROM working_hours 
        ORDER BY date DESC
        """
        working_hours_records = await database.fetch_all(query=query)

        # Convert the 'date' field to string in the result set
        for record in working_hours_records:
            record["date"] = record["date"].strftime("%Y-%m-%d")

        return working_hours_records
    except Exception as e:
        logger.error(f"Error fetching working hours: {str(e)}")
        raise e