from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    RESIDENT = "resident"
    MANAGER = "manager"
    ADMIN = "admin"

class MeterType(str, Enum):
    WATER = "water"
    ELECTRICITY = "electricity"

# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    apartment_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.RESIDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

# Meter Reading Schemas
class MeterReadingBase(BaseModel):
    meter_type: MeterType
    reading_value: float
    image_url: str

class MeterReadingCreate(BaseModel):
    meter_type: MeterType
    reading_value: float

class MeterReadingResponse(MeterReadingBase):
    id: int
    user_id: int
    user: UserResponse
    reading_date: datetime
    verified: bool
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MeterReadingUpdate(BaseModel):
    verified: Optional[bool] = None

class MeterReadingList(BaseModel):
    readings: List[MeterReadingResponse]
    total: int

# Invoice Schemas
class InvoiceBase(BaseModel):
    amount: float
    consumption: float
    rate: float
    due_date: datetime

class InvoiceCreate(BaseModel):
    user_id: int
    meter_reading_id: int

class InvoiceResponse(InvoiceBase):
    id: int
    user_id: int
    meter_reading_id: int
    invoice_number: str
    issue_date: datetime
    paid: bool
    paid_at: Optional[datetime] = None
    user: UserResponse
    meter_reading: MeterReadingResponse

    class Config:
        from_attributes = True

class InvoiceUpdate(BaseModel):
    paid: Optional[bool] = None

class InvoiceList(BaseModel):
    invoices: List[InvoiceResponse]
    total: int

class InvoiceSummary(BaseModel):
    total_invoices: int
    total_amount: float
    paid_invoices: int
    paid_amount: float
    pending_invoices: int
    pending_amount: float
