from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import SessionLocal
from typing import List

router = APIRouter(prefix="/batches", tags=["batches"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Batch)
def create_batch(variant_id: int, batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    return crud.create_batch(db, batch, variant_id)