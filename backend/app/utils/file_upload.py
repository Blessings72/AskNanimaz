import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import Optional

# For now, we'll store files locally. We'll add S3 later.
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def ensure_upload_dir():
    """Ensure upload directory exists"""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return file path"""
    ensure_upload_dir()
    
    # Validate file type
    if not allowed_file(upload_file.filename or ""):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename or "")[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Read and save file
    contents = await upload_file.read()
    
    # Validate file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return f"/{file_path}"

def delete_upload_file(file_path: str) -> bool:
    """Delete uploaded file"""
    try:
        # Remove leading slash if present
        if file_path.startswith("/"):
            file_path = file_path[1:]
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False