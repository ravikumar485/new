from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse

from .database import Base, engine
from .routers import inventory as inventory_router
from .routers import load as load_router
from .routers import seed as seed_router
from .sse import broker


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan, title="Inventory Load System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory_router.router)
app.include_router(load_router.router)
app.include_router(seed_router.router)


@app.get("/events")
async def sse_events():
    async def event_generator():
        async for data in broker.subscribe():
            yield f"data: {data}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/display", response_class=HTMLResponse)
async def display_board():
    # Simple HTML that subscribes to SSE and shows inventory
    return """
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>Inventory Board</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { margin-bottom: 10px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f8f8f8; }
    .pos { color: green; }
    .neg { color: #b30000; }
  </style>
</head>
<body>
  <h1>Live Inventory</h1>
  <table id=\"inv\">
    <thead><tr><th>SKU</th><th>Name</th><th>Qty</th><th>Unit</th></tr></thead>
    <tbody></tbody>
  </table>
  <script>
    async function loadInventory() {
      const res = await fetch('/inventory');
      const data = await res.json();
      const tbody = document.querySelector('#inv tbody');
      tbody.innerHTML = '';
      for (const row of data) {
        const tr = document.createElement('tr');
        tr.dataset.productId = row.product_id;
        tr.innerHTML = `<td>${row.sku}</td><td>${row.name}</td><td class="qty">${row.quantity}</td><td>${row.unit}</td>`;
        tbody.appendChild(tr);
      }
    }

    function updateRow(productId, quantity) {
      const row = document.querySelector(`tr[data-product-id="${productId}"]`);
      if (row) {
        row.querySelector('.qty').textContent = quantity;
      }
    }

    const es = new EventSource('/events');
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.product_id && typeof msg.quantity === 'number') {
          updateRow(msg.product_id, msg.quantity);
        } else {
          // Fallback: refresh
          loadInventory();
        }
      } catch (err) {
        console.error('Invalid event', err);
      }
    };

    loadInventory();
  </script>
</body>
</html>
    """
