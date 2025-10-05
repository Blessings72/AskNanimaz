import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

try:
    from app.config import settings
    print("✓ Config loaded successfully!")
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"JWT Secret: {settings.JWT_SECRET_KEY[:10]}...")
except Exception as e:
    print(f"✗ Config error: {e}")
    print("Trying alternative approach...")
    
    # Try alternative approach
    from pydantic import BaseModel
    from typing import Optional
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    class SimpleSettings(BaseModel):
        DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:bLessings72$CK@localhost/postgres")
        JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
    
    simple_settings = SimpleSettings()
    print("✓ Simple config loaded as fallback")
    print(f"Database URL: {simple_settings.DATABASE_URL}")