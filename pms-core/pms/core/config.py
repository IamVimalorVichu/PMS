import os
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    def __init__(self):
        self.SECRET_KEY = os.getenv("SECRET_KEY")
        self.DATABASE_URL = os.getenv("DATABASE_URI")
        self.DATABASE_NAME = os.getenv("DATABASE_NAME")
        self.ALGORITHM = os.getenv("ALGORITHM")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

        # Uploads configuration
        self.UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")  # Default: 'uploads'
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)  # Ensure folder exists

config = BaseConfig()
