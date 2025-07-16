from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        description=product.description,
        hsn=product.hsn,
        barcode=product.barcode,
        low_stock_threshold=product.low_stock_threshold or 0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    # Add variants
    for variant in product.variants or []:
        db_variant = models.Variant(name=variant.name, product_id=db_product.id)
        db.add(db_variant)
    # Add measuring units
    for unit in product.units or []:
        db_unit = models.MeasuringUnit(
            name=unit.name,
            conversion_factor=unit.conversion_factor,
            product_id=db_product.id
        )
        db.add(db_unit)
    db.commit()
    return db_product

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_variant(db: Session, variant: schemas.VariantCreate, product_id: int):
    db_variant = models.Variant(**variant.dict(), product_id=product_id)
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant

def create_measuring_unit(db: Session, unit: schemas.MeasuringUnitCreate, product_id: int):
    db_unit = models.MeasuringUnit(**unit.dict(), product_id=product_id)
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

def create_batch(db: Session, batch: schemas.BatchCreate, variant_id: int):
    db_batch = models.Batch(**batch.dict(), variant_id=variant_id)
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

def create_stock_entry(db: Session, entry: schemas.StockEntryCreate):
    db_entry = models.StockEntry(
        batch_id=entry.batch_id,
        measuring_unit_id=entry.measuring_unit_id,
        quantity=entry.quantity,
        purchase_price=entry.purchase_price,
        entry_date=entry.entry_date or datetime.utcnow()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    # TODO: Add logic for unit conversion, price normalization, and avg price calculation
    return db_entry

def get_batches_by_variant(db: Session, variant_id: int):
    return db.query(models.Batch).filter(models.Batch.variant_id == variant_id).all()

def get_stock_entries_by_batch(db: Session, batch_id: int):
    return db.query(models.StockEntry).filter(models.StockEntry.batch_id == batch_id).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierCreate):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        for key, value in supplier.dict().items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier