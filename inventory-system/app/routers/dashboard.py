from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app import models, database

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    low_stock = 0
    for product in db.query(models.Product).all():
        # Calculate total stock for all variants/batches of this product
        total_stock = 0
        for variant in product.variants:
            for batch in variant.batches:
                stock = db.query(models.StockEntry).filter(models.StockEntry.batch_id == batch.id).with_entities(models.StockEntry.quantity).all()
                total_stock += sum([s[0] for s in stock])
        if total_stock <= (product.low_stock_threshold or 0):
            low_stock += 1
    today = date.today()
    soon = today + timedelta(days=30)
    expiring_soon = db.query(models.Batch).filter(models.Batch.expiry_date != None, models.Batch.expiry_date > today, models.Batch.expiry_date <= soon).count()
    expired = db.query(models.Batch).filter(models.Batch.expiry_date != None, models.Batch.expiry_date < today).count()
    return {
        "total_products": total_products,
        "low_stock": low_stock,
        "expiring_soon": expiring_soon,
        "expired": expired,
    }

@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    results = []
    for product in db.query(models.Product).all():
        total_stock = 0
        for variant in product.variants:
            for batch in variant.batches:
                stock = db.query(models.StockEntry).filter(models.StockEntry.batch_id == batch.id).with_entities(models.StockEntry.quantity).all()
                total_stock += sum([s[0] for s in stock])
        if total_stock <= (product.low_stock_threshold or 0):
            results.append({
                "name": product.name,
                "stock": total_stock,
                "threshold": product.low_stock_threshold or 0
            })
    return results

@router.get("/expiring-soon")
def get_expiring_soon(db: Session = Depends(get_db)):
    today = date.today()
    soon = today + timedelta(days=30)
    batches = db.query(models.Batch).filter(models.Batch.expiry_date != None, models.Batch.expiry_date > today, models.Batch.expiry_date <= soon).all()
    results = []
    for batch in batches:
        product = batch.variant.product if batch.variant and batch.variant.product else None
        results.append({
            "name": batch.batch_number,
            "product": product.name if product else None,
            "expiry": batch.expiry_date
        })
    return results

@router.get("/expired")
def get_expired(db: Session = Depends(get_db)):
    today = date.today()
    batches = db.query(models.Batch).filter(models.Batch.expiry_date != None, models.Batch.expiry_date < today).all()
    results = []
    for batch in batches:
        product = batch.variant.product if batch.variant and batch.variant.product else None
        results.append({
            "name": batch.batch_number,
            "product": product.name if product else None,
            "expiry": batch.expiry_date
        })
    return results