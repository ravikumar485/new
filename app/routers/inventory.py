from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, Inventory
from ..schemas import ProductCreate, ProductRead, InventoryRead
from ..sse import broker

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.post("/products", response_model=ProductRead)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(sku=payload.sku, name=payload.name, unit=payload.unit)
    db.add(product)
    db.flush()
    inv = Inventory(product_id=product.id, quantity=0)
    db.add(inv)
    db.commit()
    db.refresh(product)
    return product


@router.get("/products", response_model=List[ProductRead])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@router.get("", response_model=List[InventoryRead])
def list_inventory(db: Session = Depends(get_db)):
    rows = (
        db.query(Inventory, Product)
        .join(Product, Inventory.product_id == Product.id)
        .order_by(Product.id)
        .all()
    )
    return [
        InventoryRead(
            product_id=p.id, sku=p.sku, name=p.name, quantity=i.quantity, unit=p.unit
        )
        for i, p in rows
    ]


@router.post("/adjust/{product_id}")
def adjust_inventory(product_id: int, delta: int, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
    inv.quantity += delta
    if inv.quantity < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    db.add(inv)
    db.commit()
    # Broadcast change
    import json

    payload = json.dumps({"product_id": product_id, "delta": delta, "quantity": inv.quantity})
    # schedule publish without blocking
    import anyio

    anyio.from_thread.run(broker.publish, payload)
    return {"ok": True, "quantity": inv.quantity}
