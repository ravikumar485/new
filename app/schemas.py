from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=255)
    unit: str = Field(default="pcs", min_length=1, max_length=32)


class ProductRead(BaseModel):
    id: int
    sku: str
    name: str
    unit: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InventoryRead(BaseModel):
    product_id: int
    sku: str
    name: str
    quantity: int
    unit: str


class LoadItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class LoadCreate(BaseModel):
    salesman: str
    vehicle: str
    items: List[LoadItemCreate]


class LoadRead(BaseModel):
    id: int
    salesman: str
    vehicle: str
    created_at: datetime

    class Config:
        from_attributes = True
