from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from typing import Dict
import shutil
import os

router = APIRouter(prefix="/invoices", tags=["invoices"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Dict:
    # Save file temporarily
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # TODO: Use OCR to extract text from PDF/image
    # For now, simulate parsed data
    parsed_data = {
        "supplier_name": "Demo Supplier",
        "invoice_number": "INV12345",
        "date": "2024-06-01",
        "items": [
            {"name": "Product A", "quantity": 10, "price": 100},
            {"name": "Product B", "quantity": 5, "price": 50},
        ]
    }
    # TODO: Store parsed data in DB (create supplier, products, stock entries, etc.)
    # Clean up temp file
    os.remove(temp_path)
    return {"parsed": parsed_data, "message": "Invoice processed (simulated)"}