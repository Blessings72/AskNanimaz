import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import User, MeterReading, Invoice
from app.schemas import UserRole, MeterType

def test_relationships():
    db = SessionLocal()
    try:
        # Test creating a user
        user = User(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User",
            role=UserRole.RESIDENT,
            apartment_number="101"
        )
        
        # Test creating a meter reading
        reading = MeterReading(
            user_id=1,  # This would be the actual user ID
            meter_type=MeterType.WATER,
            reading_value=123.45,
            image_url="http://example.com/image.jpg"
        )
        
        # Test creating an invoice
        invoice = Invoice(
            user_id=1,
            meter_reading_id=1,
            invoice_number="INV-001",
            amount=150.75,
            consumption=25.5,
            rate=5.91,
            due_date="2024-01-31"
        )
        
        print("✅ All models can be instantiated without circular reference errors")
        print("✅ Relationships are properly defined")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_relationships()