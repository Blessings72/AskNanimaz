import sys
import os
sys.path.append(os.path.dirname(__file__))

print("Testing SQLite setup...")

try:
    from app.config import settings
    print(f"✓ Config loaded: {settings.DATABASE_URL}")
    
    from app.database import engine, Base
    from app.models import User, MeterReading, Invoice
    
    # Test connection
    with engine.connect() as conn:
        print("✓ Database connection successful")
    
    # Create tables directly (alternative to alembic)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    
    print("\n🎉 SQLite setup completed successfully!")
    print("You can now start the server with: uvicorn main:app --reload")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("\n💡 Try creating tables directly:")
    print("from app.database import Base, engine")
    print("from app.models import User, MeterReading, Invoice")  
    print("Base.metadata.create_all(bind=engine)")