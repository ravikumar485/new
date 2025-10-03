from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import SessionLocal
from typing import List

router = APIRouter(prefix="/units", tags=["units"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.MeasuringUnit)
def create_unit(product_id: int, unit: schemas.MeasuringUnitCreate, db: Session = Depends(get_db)):
    return crud.create_measuring_unit(db, unit, product_id)