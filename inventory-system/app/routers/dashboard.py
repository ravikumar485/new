from fastapi import APIRouter
from datetime import date, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary():
    return {
        "total_products": 120,
        "low_stock": 8,
        "expiring_soon": 5,
        "expired": 2,
    }

@router.get("/low-stock")
def get_low_stock():
    return [
        {"name": "Product A", "stock": 3, "threshold": 5},
        {"name": "Product B", "stock": 2, "threshold": 4},
    ]

@router.get("/expiring-soon")
def get_expiring_soon():
    return [
        {"name": "Batch X", "product": "Product A", "expiry": str(date.today() + timedelta(days=10))},
        {"name": "Batch Y", "product": "Product B", "expiry": str(date.today() + timedelta(days=15))},
    ]

@router.get("/expired")
def get_expired():
    return [
        {"name": "Batch Z", "product": "Product C", "expiry": str(date.today() - timedelta(days=10))},
    ]