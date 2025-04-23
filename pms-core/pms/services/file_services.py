import os
import shutil
from fastapi import UploadFile
from pms.core.config import config

class FileService:
    @staticmethod
    async def save_file(file: UploadFile) -> dict:
        file_path = os.path.join(config.UPLOAD_DIR, file.filename)
        
        # Ensure unique filename
        base_name = os.path.splitext(file.filename)[0]
        extension = os.path.splitext(file.filename)[1]
        counter = 1
        while os.path.exists(file_path):
            file_path = os.path.join(config.UPLOAD_DIR, f"{base_name}_{counter}{extension}")
            counter += 1

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "filename": os.path.basename(file_path),
            "filepath": file_path
        }
    
file_service = FileService()