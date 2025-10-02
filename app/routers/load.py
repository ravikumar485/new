from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, Inventory, Load, LoadItem
from ..schemas import LoadCreate, LoadRead
from ..sse import broker

router = APIRouter(prefix="/load", tags=["load"])


@router.post("", response_model=LoadRead)
def create_load(payload: LoadCreate, db: Session = Depends(get_db)):
    # Validate products and stock
    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
    if len(products) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="One or more products not found")

    # Check stock
    for item in payload.items:
        inv = db.query(Inventory).filter(Inventory.product_id == item.product_id).with_for_update().first()
        if not inv or inv.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product_id {item.product_id}")

    # Create load and deduct
    load = Load(salesman=payload.salesman, vehicle=payload.vehicle)
    db.add(load)
    db.flush()

    for item in payload.items:
        inv = db.query(Inventory).filter(Inventory.product_id == item.product_id).with_for_update().first()
        inv.quantity -= item.quantity
        db.add(LoadItem(load_id=load.id, product_id=item.product_id, quantity=item.quantity))
        db.add(inv)

    db.commit()
    db.refresh(load)

    # Broadcast changes
    import json, anyio

    for item in payload.items:
        inv = db.query(Inventory).filter(Inventory.product_id == item.product_id).first()
        msg = json.dumps({
            "event": "load",
            "product_id": item.product_id,
            "delta": -item.quantity,
            "quantity": inv.quantity if inv else None
        })
        anyio.from_thread.run(broker.publish, msg)

    return load
