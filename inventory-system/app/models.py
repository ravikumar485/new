from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    hsn = Column(String)
    barcode = Column(String)
    low_stock_threshold = Column(Integer, default=0)
    variants = relationship("Variant", back_populates="product")
    units = relationship("MeasuringUnit", back_populates="product")

class Variant(Base):
    __tablename__ = "variants"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, nullable=False)
    product = relationship("Product", back_populates="variants")
    batches = relationship("Batch", back_populates="variant")

class MeasuringUnit(Base):
    __tablename__ = "measuring_units"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)  # e.g., carton, piece
    conversion_factor = Column(Float, nullable=False)  # to base unit
    product_id = Column(Integer, ForeignKey("products.id"))
    product = relationship("Product", back_populates="units")

class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True)
    variant_id = Column(Integer, ForeignKey("variants.id"))
    batch_number = Column(String, nullable=False)
    expiry_date = Column(Date)
    barcode = Column(String)
    variant = relationship("Variant", back_populates="batches")
    stock_entries = relationship("StockEntry", back_populates="batch")

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    contact = Column(String)
    address = Column(String)
    gst = Column(String)
    email = Column(String)
    phone = Column(String)
    stock_entries = relationship("StockEntry", back_populates="supplier")

class StockEntry(Base):
    __tablename__ = "stock_entries"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    measuring_unit_id = Column(Integer, ForeignKey("measuring_units.id"))
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    entry_date = Column(DateTime)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    batch = relationship("Batch", back_populates="stock_entries")
    measuring_unit = relationship("MeasuringUnit")
    supplier = relationship("Supplier", back_populates="stock_entries")