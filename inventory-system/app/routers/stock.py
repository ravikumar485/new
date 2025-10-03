from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import SessionLocal
from typing import List

router = APIRouter(prefix="/stock", tags=["stock"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.StockEntry)
def create_stock_entry(entry: schemas.StockEntryCreate, db: Session = Depends(get_db)):
    return crud.create_stock_entry(db, entry)