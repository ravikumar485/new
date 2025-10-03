from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Update the following with your actual database URL
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/inventory_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)