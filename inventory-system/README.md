# Inventory Management System

This is an inventory management system for e-commerce-like use cases, supporting products with variants, multiple measuring units, batch tracking, expiry, and price normalization.

## Features
- Products with variants/flavours
- Multiple measuring units (e.g., cartons, pieces) with conversion
- Batch, barcode, HSN, expiry tracking
- Stock entry in any unit, with price normalization
- Average price calculation per unit
- Low stock, ready to expire, and expired product monitoring

## Tech Stack
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure your PostgreSQL database in `app/database.py` (to be created).
3. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```