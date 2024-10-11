from typing import Optional
from databases import Database

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'

database = Database(DATABASE_URL)

# Function to connect to the database
async def connect_db():
    await database.connect()
    print(f"Database connected: {database.is_connected}")

# Function to disconnect from the database
async def disconnect_db():
    await database.disconnect()
    print("Database disconnected")

# Function to insert a new user into the users table
async def insert_user(username: str, password_hash: str, email: str):
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

# Function to select a user by username from the users table
async def get_user(username: str):
    query = "SELECT * FROM users WHERE username = :username"
    return await database.fetch_one(query=query, values={"username": username})

# Function to select a user by email and password from the users table
async def get_user_by_email(email: str, password_hash: str):
    query = "SELECT * FROM users WHERE email = :email and password_hash = :password_hash"
    return await database.fetch_one(query=query, values={"email": email, "password_hash": password_hash})

# Function to update a user in the users table
async def update_user(user_id: int, username: Optional[str], password_hash: Optional[str], email: Optional[str]):
    update_fields = []
    values = {"user_id": user_id}
    
    if username is not None:
        update_fields.append("username = :username")
        values["username"] = username
    
    if password_hash is not None:
        update_fields.append("password_hash = :password_hash")
        values["password_hash"] = password_hash
    
    if email is not None:
        update_fields.append("email = :email")
        values["email"] = email
    
    if not update_fields:
        return None  # No updates to perform
    
    query = f"""
    UPDATE users
    SET {', '.join(update_fields)}
    WHERE user_id = :user_id
    RETURNING user_id, username, password_hash, email, created_at
    """
    return await database.fetch_one(query=query, values=values)

# Function to delete a user from the users table
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
    return await database.fetch_one(query=query, values={"user_id": user_id})

# Employee Functions

# Function to insert a new employee into the employees table
async def insert_employee(name: str, department: str, role: str, start_time: str, end_time: str):
    query = """
    INSERT INTO employees (name, department, role, start_time, end_time)
    VALUES (:name, :department, :role, :start_time, :end_time)
    RETURNING employee_id, name, department, role, start_time, end_time
    """
    values = {"name": name, "department": department, "role": role, "start_time": start_time, "end_time": end_time}
    return await database.fetch_one(query=query, values=values)

# Function to retrieve all employees
async def get_employees():
    try:
        query = "SELECT * FROM employees"
        employees = await database.fetch_all(query=query)
        if employees:
            print(f"Fetched employees: {employees}")
        else:
            print("No employees found in the database.")
        return employees
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return []

# Function to update an employee in the employees table
async def update_employee(employee_id: int, name: Optional[str], department: Optional[str], role: Optional[str], start_time: Optional[str], end_time: Optional[str]):
    update_fields = []
    values = {"employee_id": employee_id}
    
    if name is not None:
        update_fields.append("name = :name")
        values["name"] = name
    
    if department is not None:
        update_fields.append("department = :department")
        values["department"] = department
    
    if role is not None:
        update_fields.append("role = :role")
        values["role"] = role
    
    if start_time is not None:
        update_fields.append("start_time = :start_time")
        values["start_time"] = start_time
    
    if end_time is not None:
        update_fields.append("end_time = :end_time")
        values["end_time"] = end_time
    
    if not update_fields:
        return None  # No updates to perform
    
    query = f"""
    UPDATE employees
    SET {', '.join(update_fields)}
    WHERE employee_id = :employee_id
    RETURNING employee_id, name, department, role, start_time, end_time
    """
    return await database.fetch_one(query=query, values=values)

# Function to delete an employee from the employees table
async def delete_employee(employee_id: int):
    query = "DELETE FROM employees WHERE employee_id = :employee_id RETURNING *"
    return await database.fetch_one(query=query, values={"employee_id": employee_id})
