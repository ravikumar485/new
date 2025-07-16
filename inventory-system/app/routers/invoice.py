from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas, crud
from typing import Dict, Any
import shutil
import os
import pytesseract
from PIL import Image
import re

router = APIRouter(prefix="/invoices", tags=["invoices"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Dict:
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # OCR: Only support images for demo (PDF support would require pdf2image)
    try:
        image = Image.open(temp_path)
        text = pytesseract.image_to_string(image)
    except Exception as e:
        os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"OCR failed: {e}")
    os.remove(temp_path)
    # Simple regex-based parsing (for demo)
    supplier_match = re.search(r'Supplier[:\s]+([\w\s]+)', text)
    invoice_match = re.search(r'Invoice\s*No[:\s]+([\w\d-]+)', text)
    date_match = re.search(r'Date[:\s]+([\d-]+)', text)
    items = []
    for line in text.splitlines():
        m = re.match(r'(Product\s*\w+)\s+(\d+)\s+(\d+)', line)
        if m:
            items.append({"name": m.group(1), "quantity": int(m.group(2)), "price": float(m.group(3))})
    parsed_data = {
        "supplier_name": supplier_match.group(1).strip() if supplier_match else "",
        "invoice_number": invoice_match.group(1).strip() if invoice_match else "",
        "date": date_match.group(1).strip() if date_match else "",
        "items": items
    }
    return {"parsed": parsed_data, "message": "Invoice OCR and parsing complete. Please confirm to save."}

@router.post("/confirm")
def confirm_invoice(data: Dict[str, Any], db: Session = Depends(get_db)):
    # Store supplier
    supplier = db.query(models.Supplier).filter(models.Supplier.name == data["supplier_name"]).first()
    if not supplier:
        supplier = models.Supplier(name=data["supplier_name"])
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
    # Store products and stock entries
    for item in data["items"]:
        product = db.query(models.Product).filter(models.Product.name == item["name"]).first()
        if not product:
            product = models.Product(name=item["name"])
            db.add(product)
            db.commit()
            db.refresh(product)
        # Create a stock entry (minimal fields for demo)
        stock_entry = models.StockEntry(
            batch_id=None,  # Should be set properly in real use
            measuring_unit_id=None,  # Should be set properly in real use
            quantity=item["quantity"],
            purchase_price=item["price"],
            supplier_id=supplier.id
        )
        db.add(stock_entry)
    db.commit()
    return {"message": "Invoice data saved to database."}