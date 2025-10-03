from fastapi import FastAPI
from app.routers import product, variant, unit, batch, stock, dashboard
from app.routers import supplier
from app.routers import invoice

app = FastAPI()

app.include_router(product.router)
app.include_router(variant.router)
app.include_router(unit.router)
app.include_router(batch.router)
app.include_router(stock.router)
app.include_router(dashboard.router)
app.include_router(supplier.router)
app.include_router(invoice.router)

@app.get("/")
def read_root():
    return {"message": "Inventory Management System API"}