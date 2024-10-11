from databases import Database

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'

database = Database(DATABASE_URL)

async def connect_db():
    await database.connect()
    print("Database connected")

async def disconnect_db():
    await database.disconnect()
    print("Database disconnected")

# User Functions
async def insert_user(username: str, password_hash: str, email: str):
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

async def get_user(username: str):
    query = "SELECT * FROM users WHERE username = :username"
    return await database.fetch_one(query=query, values={"username": username})

async def get_user_by_email(email: str, password_hash: str):
    query = "SELECT * FROM users WHERE email = :email and password_hash = :password_hash"
    return await database.fetch_one(query=query, values={"email": email, "password_hash": password_hash})

async def update_user(user_id: int, username: str, password_hash: str, email: str):
    query = """
    UPDATE users
    SET username = :username, password_hash = :password_hash, email = :email
    WHERE user_id = :user_id
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
    return await database.fetch_one(query=query, values={"user_id": user_id})

# Employee Functions
async def insert_employee(name: str, department: str, role: str, start_time: str, end_time: str):
    query = """
    INSERT INTO employees (name, department, role, start_time, end_time)
    VALUES (:name, :department, :role, :start_time, :end_time)
    RETURNING id, name, department, role, start_time, end_time
    """
    values = {"name": name, "department": department, "role": role, "start_time": start_time, "end_time": end_time}
    return await database.fetch_one(query=query, values=values)

async def get_all_employees():
    query = "SELECT * FROM employees"
    return await database.fetch_all(query=query)

async def update_employee(id: int, name: str, department: str, role: str, start_time: str, end_time: str):
    query = """
    UPDATE employees
    SET name = :name, department = :department, role = :role, start_time = :start_time, end_time = :end_time
    WHERE id = :id
    RETURNING id, name, department, role, start_time, end_time
    """
    values = {"id": id, "name": name, "department": department, "role": role, "start_time": start_time, "end_time": end_time}
    return await database.fetch_one(query=query, values=values)

async def delete_employee(id: int):
    query = "DELETE FROM employees WHERE id = :id RETURNING *"
    return await database.fetch_one(query=query, values={"id": id})
