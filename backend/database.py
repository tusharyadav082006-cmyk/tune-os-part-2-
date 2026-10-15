"""
TuneOS: Database Connection Module (MySQL)
Provides simple, beginner-friendly MySQL database connections and helpers.
"""

import os
import mysql.connector
from mysql.connector import Error, pooling
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "tuneos_db")

connection_pool = None

def init_connection_pool():
    """
    Initializes a connection pool for efficient MySQL connections.
    If MySQL server is not running locally, raises an understandable error.
    """
    global connection_pool
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="tuneos_pool",
            pool_size=5,
            pool_reset_session=True,
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        print(f"[MySQL] Successfully connected to database '{DB_NAME}' on {DB_HOST}:{DB_PORT}")
    except Error as err:
        print("\n========================================================")
        print(" [!] MySQL Connection Error:")
        print(f"     Could not connect to MySQL on {DB_HOST}:{DB_PORT}.")
        print("     Error details:", err)
        print("     Tip: Make sure MySQL Server is running in XAMPP or Windows Services,")
        print("          and verify credentials in backend/.env match MySQL Workbench.")
        print("========================================================\n")
        connection_pool = None

def get_db_connection():
    """
    Retrieves a connection from the pool or opens a direct connection.
    Remember to always close the connection in a finally block!
    """
    global connection_pool
    if connection_pool is None:
        init_connection_pool()
        if connection_pool is None:
            raise ConnectionError(
                "MySQL database is currently unreachable. "
                "Please ensure MySQL is running on localhost:3306 and check credentials in backend/.env."
            )
    try:
        return connection_pool.get_connection()
    except Error as err:
        raise ConnectionError(f"Failed to acquire MySQL connection from pool: {err}")
