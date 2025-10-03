from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import SessionLocal
from typing import List

router = APIRouter(prefix="/variants", tags=["variants"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Variant)
def create_variant(product_id: int, variant: schemas.VariantCreate, db: Session = Depends(get_db)):
    return crud.create_variant(db, variant, product_id)