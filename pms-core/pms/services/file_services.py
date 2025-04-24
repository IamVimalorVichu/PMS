import os
import shutil
from fastapi import UploadFile
from pms.core.config import config

class FileService:
    @staticmethod
    async def save_file(file: UploadFile, student_id: str, file_type: str) -> dict:
        # Create base directory structure
        student_dir = os.path.join(config.UPLOAD_DIR, student_id)
        if not os.path.exists(student_dir):
            os.makedirs(student_dir)

        # Create type-specific directory
        type_dir = "certifications" if file_type == "certification" else "job_applications"
        target_dir = os.path.join(student_dir, type_dir)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)

        file_path = os.path.join(target_dir, file.filename)
        
        # Ensure unique filename
        base_name = os.path.splitext(file.filename)[0]
        extension = os.path.splitext(file.filename)[1]
        counter = 1
        while os.path.exists(file_path):
            file_path = os.path.join(target_dir, f"{base_name}_{counter}{extension}")
            counter += 1

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return relative path from UPLOAD_DIR
        rel_path = os.path.relpath(file_path, config.UPLOAD_DIR)
            
        return {
            "filename": os.path.basename(file_path),
            "filepath": rel_path
        }
    
    @staticmethod
    async def delete_file(filepath: str) -> bool:
        """
        Deletes a file specified by its relative path from the UPLOAD_DIR.
        Also attempts to clean up empty parent directories (type and student).

        Args:
            filepath: The relative path of the file from config.UPLOAD_DIR
                      (this should be the value stored in the database).

        Returns:
            True if the file was deleted successfully or didn't exist.
            False if an error occurred during deletion.
        """
        if not filepath:
            print("Warning: delete_file called with empty filepath.")
            return False # Or True, depending if empty path means "nothing to delete"

        try:
            # Construct the full absolute path
            full_path = os.path.join(config.UPLOAD_DIR, filepath)
            full_path = os.path.normpath(full_path) # Normalize path separators

            # Security check: Ensure the path is still within the UPLOAD_DIR
            if not full_path.startswith(os.path.normpath(config.UPLOAD_DIR)):
                print(f"Error: Attempted deletion outside UPLOAD_DIR: {filepath}")
                return False # Prevent directory traversal

            if os.path.exists(full_path) and os.path.isfile(full_path):
                # Delete the file
                os.remove(full_path)
                print(f"Successfully deleted file: {full_path}")

                # Attempt to clean up empty directories
                type_dir = os.path.dirname(full_path)
                student_dir = os.path.dirname(type_dir)

                try:
                    # Check if type directory is empty and remove it
                    if not os.listdir(type_dir):
                        os.rmdir(type_dir)
                        print(f"Removed empty directory: {type_dir}")

                        # Check if student directory is now empty and remove it
                        # Ensure student_dir is still within UPLOAD_DIR before removing
                        if student_dir != os.path.normpath(config.UPLOAD_DIR) and \
                           student_dir.startswith(os.path.normpath(config.UPLOAD_DIR)) and \
                           not os.listdir(student_dir):
                            os.rmdir(student_dir)
                            print(f"Removed empty directory: {student_dir}")

                except OSError as dir_err:
                    # This might happen if the directory is not empty (e.g., race condition)
                    # or due to permissions issues. It's often safe to ignore.
                    print(f"Could not remove directory {type_dir} or {student_dir} (might not be empty): {dir_err}")
                except Exception as e:
                     print(f"Unexpected error during directory cleanup for {filepath}: {e}")


                return True # File was deleted

            elif os.path.isdir(full_path):
                 print(f"Warning: Attempted to delete a directory, not a file: {filepath}")
                 return False # Should only delete files

            else:
                # File does not exist - consider this a success for idempotency
                print(f"Warning: File not found for deletion (already deleted?): {full_path}")
                return True

        except OSError as e:
            # Handle errors during os.remove or os.rmdir (e.g., permissions)
            print(f"Error deleting file or directory for path {filepath}: {e}")
            return False
        except Exception as e:
            # Catch any other unexpected errors
            print(f"Unexpected error during file deletion for path {filepath}: {e}")
            return False

    
file_service = FileService()