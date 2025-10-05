from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    RESIDENT = "resident"
    MANAGER = "manager"
    ADMIN = "admin"

class MeterType(str, enum.Enum):
    WATER = "water"
    ELECTRICITY = "electricity"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.RESIDENT)
    apartment_number = Column(String(50), nullable=True)  # Only for residents
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - explicitly specify foreign keys
    meter_readings = relationship("MeterReading", back_populates="user", foreign_keys="MeterReading.user_id")
    verified_readings = relationship("MeterReading", back_populates="verifier", foreign_keys="MeterReading.verified_by")
    invoices = relationship("Invoice", back_populates="user")

class MeterReading(Base):
    __tablename__ = "meter_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meter_type = Column(SQLEnum(MeterType), nullable=False)
    reading_value = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=False)  # S3 URL for the meter image
    reading_date = Column(DateTime(timezone=True), server_default=func.now())
    verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships - explicitly specify foreign keys
    user = relationship("User", back_populates="meter_readings", foreign_keys=[user_id])
    verifier = relationship("User", back_populates="verified_readings", foreign_keys=[verified_by])
    invoices = relationship("Invoice", back_populates="meter_reading")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meter_reading_id = Column(Integer, ForeignKey("meter_readings.id"), nullable=False)
    invoice_number = Column(String(100), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    consumption = Column(Float, nullable=False)  # Units consumed
    rate = Column(Float, nullable=False)  # Rate per unit
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    meter_reading = relationship("MeterReading", back_populates="invoices")