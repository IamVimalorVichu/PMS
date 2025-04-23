from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pms.core.config import config
import asyncio


class DatabaseConnection:
    _instance: Optional["DatabaseConnection"] = None

    def __new__(cls):
        """Ensure only one instance of the database connection is created."""
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self, max_retries=5, retry_delay=2):
        if not hasattr(self, 'client'):
            self.database_name = config.DATABASE_NAME
            self.database_url = config.DATABASE_URL
            self.client = None
            self.db = None
            self.max_retries = max_retries 
            self.retry_delay = retry_delay

    async def connect(self):
        retries = 0
        while retries < self.max_retries:
            try:
                if not self.database_url:
                    raise ValueError("Database URL not set")
                if not self.database_name:
                    raise ValueError("Database name not set")

                self.client = AsyncIOMotorClient(self.database_url)
                self.db = self.client[self.database_name]
                
                await self.db.command("ping")
                print(f"Connected to MongoDB at {self.database_url} | using database {self.database_name}")
                break   
            
            except (ValueError, Exception) as e:
                retries += 1
                print(f"Attempt {retries} failed: {e}")

                if retries >= self.max_retries:
                    raise Exception(f"Failed to connect to MongoDB after {self.max_retries} attempts.")

                delay = self.retry_delay * (2 ** (retries - 1))  
                print(f"Retrying in {delay} seconds...")
                await asyncio.sleep(delay)

    async def close(self):
        if self.client:
            self.client.close()
            print(f"Connection to {self.database_name} closed.")
        else:
            print("No connection to close.")

    async def get_collection(self, collection_name: str):
        """Get this collection from the database."""
        if self.db is None:
            raise Exception("Database is not connected!")
        return self.db[collection_name]
    



# from motor.motor_asyncio import AsyncIOMotorClient

# # MongoDB Connection String
# MONGO_URI = "mongodb://localhost:27017"  # Update if needed
# DB_NAME = "PMS"  # Change database name if required

# # Initialize MongoDB Client
# client = AsyncIOMotorClient(MONGO_URI)
# db = client[DB_NAME]

# # Collections
# users_collection = db["users"]
# student_collection = db["students"]
# company_collection = db["companies"]
# drive_collection = db["drives"]
# job_collection = db["jobs"]
# req_collection = db["requirements"]
# drive_company_collection = db["company-drives"]




