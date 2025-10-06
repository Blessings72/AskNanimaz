from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Invoice, MeterReading, User
import random
import string

class InvoiceService:
    @staticmethod
    def generate_invoice_number() -> str:
        """Generate unique invoice number"""
        timestamp = datetime.now().strftime("%Y%m%d")
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"INV-{timestamp}-{random_str}"

    @staticmethod
    def calculate_consumption(current_reading: MeterReading, previous_reading: MeterReading = None) -> float:
        """Calculate consumption from current and previous readings"""
        if not previous_reading:
            return current_reading.reading_value
        
        return current_reading.reading_value - previous_reading.reading_value

    @staticmethod
    def get_rates() -> dict:
        """Get rates for different meter types"""
        # In production, these would come from a database or configuration
        return {
            "water": 5.50,  # $5.50 per unit
            "electricity": 0.15  # $0.15 per kWh
        }

    @staticmethod
    def calculate_amount(consumption: float, meter_type: str) -> float:
        """Calculate invoice amount based on consumption and rates"""
        rates = InvoiceService.get_rates()
        rate = rates.get(meter_type, 0)
        return round(consumption * rate, 2)

    @staticmethod
    def get_previous_reading(db: Session, user_id: int, meter_type: str, current_reading_date: datetime) -> MeterReading:
        """Get the previous reading for a user and meter type"""
        return db.query(MeterReading).filter(
            and_(
                MeterReading.user_id == user_id,
                MeterReading.meter_type == meter_type,
                MeterReading.reading_date < current_reading_date,
                MeterReading.verified == True
            )
        ).order_by(MeterReading.reading_date.desc()).first()

    @staticmethod
    def generate_invoice_for_reading(db: Session, reading: MeterReading) -> Invoice:
        """Generate an invoice for a verified meter reading"""
        # Get previous reading for consumption calculation
        previous_reading = InvoiceService.get_previous_reading(
            db, reading.user_id, reading.meter_type.value, reading.reading_date
        )
        
        # Calculate consumption
        consumption = InvoiceService.calculate_consumption(reading, previous_reading)
        
        # Calculate amount
        amount = InvoiceService.calculate_amount(consumption, reading.meter_type.value)
        
        # Get rate used
        rate = InvoiceService.get_rates()[reading.meter_type.value]
        
        # Set due date (30 days from issue)
        due_date = datetime.now() + timedelta(days=30)
        
        # Create invoice
        invoice = Invoice(
            user_id=reading.user_id,
            meter_reading_id=reading.id,
            invoice_number=InvoiceService.generate_invoice_number(),
            amount=amount,
            consumption=consumption,
            rate=rate,
            due_date=due_date
        )
        
        return invoice

    @staticmethod
    def generate_invoices_for_verified_readings(db: Session) -> list[Invoice]:
        """Generate invoices for all verified readings that don't have invoices yet"""
        # Find verified readings without invoices
        readings_without_invoices = db.query(MeterReading).filter(
            and_(
                MeterReading.verified == True,
                ~MeterReading.invoices.any()
            )
        ).all()
        
        generated_invoices = []
        for reading in readings_without_invoices:
            invoice = InvoiceService.generate_invoice_for_reading(db, reading)
            db.add(invoice)
            generated_invoices.append(invoice)
        
        db.commit()
        
        # Refresh and return the generated invoices
        for invoice in generated_invoices:
            db.refresh(invoice)
        
        return generated_invoices

    @staticmethod
    def generate_invoices_for_user(db: Session, user_id: int) -> list[Invoice]:
        """Generate invoices for a specific user's verified readings"""
        readings_without_invoices = db.query(MeterReading).filter(
            and_(
                MeterReading.user_id == user_id,
                MeterReading.verified == True,
                ~MeterReading.invoices.any()
            )
        ).all()
        
        generated_invoices = []
        for reading in readings_without_invoices:
            invoice = InvoiceService.generate_invoice_for_reading(db, reading)
            db.add(invoice)
            generated_invoices.append(invoice)
        
        db.commit()
        
        for invoice in generated_invoices:
            db.refresh(invoice)
        
        return generated_invoices

    @staticmethod
    def mark_invoice_paid(db: Session, invoice_id: int) -> Invoice:
        """Mark an invoice as paid"""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if invoice:
            invoice.paid = True
            invoice.paid_at = datetime.now()
            db.commit()
            db.refresh(invoice)
        return invoice