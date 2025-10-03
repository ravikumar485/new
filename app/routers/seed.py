from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, Inventory

router = APIRouter(prefix="/seed", tags=["seed"]) 

@router.post("")
def seed(db: Session = Depends(get_db)):
    if db.query(Product).count() > 0:
        return {"ok": True, "skipped": True}
    items = [
        {"sku": "MILK-1L", "name": "Milk 1L", "unit": "bottle", "qty": 120},
        {"sku": "BREAD", "name": "Bread Loaf", "unit": "loaf", "qty": 80},
        {"sku": "EGG-12", "name": "Eggs (12)", "unit": "pack", "qty": 60},
    ]
    for it in items:
        p = Product(sku=it["sku"], name=it["name"], unit=it["unit"])
        db.add(p)
        db.flush()
        db.add(Inventory(product_id=p.id, quantity=it["qty"]))
    db.commit()
    return {"ok": True}
