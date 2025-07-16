from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class MeasuringUnitBase(BaseModel):
    name: str
    conversion_factor: float

class MeasuringUnitCreate(MeasuringUnitBase):
    pass

class MeasuringUnit(MeasuringUnitBase):
    id: int
    class Config:
        orm_mode = True

class VariantBase(BaseModel):
    name: str

class VariantCreate(VariantBase):
    pass

class Variant(VariantBase):
    id: int
    class Config:
        orm_mode = True

class BatchBase(BaseModel):
    batch_number: str
    expiry_date: Optional[date]
    barcode: Optional[str]

class BatchCreate(BatchBase):
    pass

class Batch(BatchBase):
    id: int
    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str]
    hsn: Optional[str]
    barcode: Optional[str]
    low_stock_threshold: Optional[int] = 0

class ProductCreate(ProductBase):
    variants: Optional[List[VariantCreate]] = []
    units: Optional[List[MeasuringUnitCreate]] = []

class Product(ProductBase):
    id: int
    variants: List[Variant] = []
    units: List[MeasuringUnit] = []
    class Config:
        orm_mode = True

class StockEntryBase(BaseModel):
    batch_id: int
    measuring_unit_id: int
    quantity: float
    purchase_price: float
    entry_date: Optional[datetime] = None

class StockEntryCreate(StockEntryBase):
    pass

class StockEntry(StockEntryBase):
    id: int
    class Config:
        orm_mode = True