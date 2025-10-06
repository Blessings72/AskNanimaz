from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, MeterReading, MeterType
from app import auth
from app.schemas import (
    MeterReadingResponse, 
    MeterReadingCreate, 
    MeterReadingList,
    MeterReadingUpdate
)
from app.utils.file_upload import save_upload_file

router = APIRouter(prefix="/meter-readings", tags=["meter readings"])

@router.post("/upload", response_model=MeterReadingResponse)
async def upload_meter_reading(
    meter_type: MeterType = Form(...),
    reading_value: float = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a new meter reading with image proof"""
    # Only residents can upload readings
    if current_user.role not in ["resident", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only residents can upload meter readings"
        )
    
    try:
        # Save the uploaded image
        image_url = await save_upload_file(image)
        
        # Create meter reading record
        db_reading = MeterReading(
            user_id=current_user.id,
            meter_type=meter_type,
            reading_value=reading_value,
            image_url=image_url
        )
        
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        
        # Return reading with user info
        return MeterReadingResponse.from_orm(db_reading)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload meter reading: {str(e)}"
        )

@router.get("/my-readings", response_model=MeterReadingList)
def get_my_readings(
    skip: int = 0,
    limit: int = 100,
    meter_type: Optional[MeterType] = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's meter readings"""
    query = db.query(MeterReading).filter(MeterReading.user_id == current_user.id)
    
    if meter_type:
        query = query.filter(MeterReading.meter_type == meter_type)
    
    readings = query.order_by(MeterReading.reading_date.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return MeterReadingList(
        readings=[MeterReadingResponse.from_orm(reading) for reading in readings],
        total=total
    )

@router.get("/all", response_model=MeterReadingList)
def get_all_readings(
    skip: int = 0,
    limit: int = 100,
    meter_type: Optional[MeterType] = None,
    verified: Optional[bool] = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all meter readings (managers and admins only)"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can view all readings"
        )
    
    query = db.query(MeterReading)
    
    if meter_type:
        query = query.filter(MeterReading.meter_type == meter_type)
    
    if verified is not None:
        query = query.filter(MeterReading.verified == verified)
    
    readings = query.order_by(MeterReading.reading_date.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return MeterReadingList(
        readings=[MeterReadingResponse.from_orm(reading) for reading in readings],
        total=total
    )

@router.get("/{reading_id}", response_model=MeterReadingResponse)
def get_reading(
    reading_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific meter reading"""
    reading = db.query(MeterReading).filter(MeterReading.id == reading_id).first()
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meter reading not found"
        )
    
    # Users can only see their own readings unless they're managers/admins
    if reading.user_id != current_user.id and current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this reading"
        )
    
    return MeterReadingResponse.from_orm(reading)

@router.patch("/{reading_id}/verify", response_model=MeterReadingResponse)
def verify_reading(
    reading_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify a meter reading (managers and admins only)"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can verify readings"
        )
    
    reading = db.query(MeterReading).filter(MeterReading.id == reading_id).first()
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meter reading not found"
        )
    
    if reading.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reading is already verified"
        )
    
    # Verify the reading
    reading.verified = True
    reading.verified_by = current_user.id
    reading.verified_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reading)
    
    return MeterReadingResponse.from_orm(reading)

@router.delete("/{reading_id}")
def delete_reading(
    reading_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a meter reading"""
    reading = db.query(MeterReading).filter(MeterReading.id == reading_id).first()
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meter reading not found"
        )
    
    # Users can only delete their own readings unless they're admins
    if reading.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reading"
        )
    
    # TODO: Also delete the associated image file
    # from app.utils.file_upload import delete_upload_file
    # delete_upload_file(reading.image_url)
    
    db.delete(reading)
    db.commit()
    
    return {"message": "Meter reading deleted successfully"}