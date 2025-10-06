from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func  # Add this import
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, Invoice
from app import auth
from app.schemas import (
    InvoiceResponse, 
    InvoiceList,
    InvoiceSummary
)
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.get("/my-invoices", response_model=InvoiceList)
def get_my_invoices(
    skip: int = 0,
    limit: int = 100,
    paid: Optional[bool] = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's invoices"""
    query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    
    if paid is not None:
        query = query.filter(Invoice.paid == paid)
    
    invoices = query.order_by(Invoice.issue_date.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return InvoiceList(
        invoices=invoices,
        total=total
    )

@router.get("/all", response_model=InvoiceList)
def get_all_invoices(
    skip: int = 0,
    limit: int = 100,
    paid: Optional[bool] = None,
    user_id: Optional[int] = None,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all invoices (managers and admins only)"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can view all invoices"
        )
    
    query = db.query(Invoice)
    
    if paid is not None:
        query = query.filter(Invoice.paid == paid)
    
    if user_id:
        query = query.filter(Invoice.user_id == user_id)
    
    invoices = query.order_by(Invoice.issue_date.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return InvoiceList(
        invoices=invoices,
        total=total
    )

@router.get("/summary", response_model=InvoiceSummary)
def get_invoice_summary(
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoice summary statistics"""
    if current_user.role not in ["manager", "admin"]:
        # Residents only see their own summary
        query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
        total_amount = db.query(func.sum(Invoice.amount)).filter(Invoice.user_id == current_user.id).scalar() or 0
        paid_amount = db.query(func.sum(Invoice.amount)).filter(
            Invoice.user_id == current_user.id, 
            Invoice.paid == True
        ).scalar() or 0
    else:
        # Managers/admins see all invoices
        query = db.query(Invoice)
        total_amount = db.query(func.sum(Invoice.amount)).scalar() or 0
        paid_amount = db.query(func.sum(Invoice.amount)).filter(Invoice.paid == True).scalar() or 0
    
    total_invoices = query.count()
    paid_invoices = query.filter(Invoice.paid == True).count()
    
    pending_invoices = total_invoices - paid_invoices
    pending_amount = total_amount - paid_amount
    
    return InvoiceSummary(
        total_invoices=total_invoices,
        total_amount=total_amount,
        paid_invoices=paid_invoices,
        paid_amount=paid_amount,
        pending_invoices=pending_invoices,
        pending_amount=pending_amount
    )

@router.post("/generate-all", response_model=List[InvoiceResponse])
def generate_all_invoices(
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate invoices for all verified readings without invoices (managers/admins only)"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can generate invoices"
        )
    
    try:
        invoices = InvoiceService.generate_invoices_for_verified_readings(db)
        return invoices
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate invoices: {str(e)}"
        )

@router.post("/generate-for-user/{user_id}", response_model=List[InvoiceResponse])
def generate_invoices_for_user(
    user_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate invoices for a specific user's verified readings (managers/admins only)"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can generate invoices"
        )
    
    try:
        invoices = InvoiceService.generate_invoices_for_user(db, user_id)
        return invoices
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate invoices: {str(e)}"
        )

@router.patch("/{invoice_id}/pay", response_model=InvoiceResponse)
def mark_invoice_paid(
    invoice_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark an invoice as paid"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Users can only mark their own invoices as paid, managers/admins can mark any
    if invoice.user_id != current_user.id and current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this invoice"
        )
    
    if invoice.paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invoice is already paid"
        )
    
    try:
        updated_invoice = InvoiceService.mark_invoice_paid(db, invoice_id)
        return updated_invoice
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update invoice: {str(e)}"
        )

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Users can only see their own invoices unless they're managers/admins
    if invoice.user_id != current_user.id and current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this invoice"
        )
    
    return invoice