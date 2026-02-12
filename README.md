# Food Delivery - Order Management System

A full-stack order management feature for a food delivery app, built with FastAPI (backend) and React + TypeScript (frontend). Supports real-time order status updates via Server-Sent Events (SSE).

## Features

- **Menu Display**: View food items with name, description, price, and image.
- **Order Placement**: Add items to cart, specify quantities, and checkout with delivery details.
- **Order Status Tracking**: Real-time updates from "Order Received" to "Delivered".
- **REST API**: FastAPI backend with SQLite persistence.
- **Real-Time Updates**: SSE for live order status changes.
- **Test-Driven Development**: Backend tests with pytest; frontend tests with Vitest.

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, SSE
- **Frontend**: React 18, TypeScript, Vite, Axios
- **Testing**: pytest (backend), Vitest + React Testing Library (frontend)

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, routes, CORS
│   │   ├── database.py      # DB connection
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # DB operations
│   │   ├── routers/
│   │   │   ├── menu.py
│   │   │   └── orders.py
│   │   └── sse.py           # SSE endpoint & subscriber mgmt
│   ├── tests/
│   │   └── test_api.py
│   ├── seed.py              # Seed initial menu items
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MenuList.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── OrderTracker.tsx
│   │   ├── hooks/
│   │   │   └── useCart.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── test/
│   │   │   ├── setup.ts
│   │   │   └── useCart.test.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tsconfig.node.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

Seed initial menu items:

```bash
python seed.py
```

API Docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173

### Running Tests

**Backend**:

```bash
cd backend
pytest tests/
```

**Frontend**:

```bash
cd frontend
npm test
```

## API Endpoints

- `GET /api/menu/` - List all menu items
- `POST /api/menu/` - Create a menu item (admin)
- `GET /api/orders/` - List all orders
- `POST /api/orders/` - Create a new order
- `GET /api/orders/{id}` - Get order details
- `PATCH /api/orders/{id}` - Update order status
- `GET /api/sse/orders/{id}` - SSE stream for order status updates

## Demo Flow

1. Start backend and frontend servers.
2. Open http://localhost:5173
3. Browse the menu and add items to cart.
4. Click "Checkout", fill delivery details, and place order.
5. The order tracker appears, showing current status.
6. Update order status via API (e.g., using curl or the Swagger UI) to see real-time updates in the UI.

Example status update:

```bash
curl -X PATCH "http://localhost:8000/api/orders/1" -H "Content-Type: application/json" -d '{"status":"preparing"}'
```

## Deployment

The frontend can be built and deployed to Vercel/Netlify:

```bash
cd frontend
npm run build
```

The `dist/` folder contains static files ready for deployment. Configure the Vite proxy or set `VITE_API_URL` to point to your deployed backend.

## Notes

- SQLite database file is created at `backend/orders.db`.
- SSE uses an in-memory subscriber list; for production, use a message broker (Redis Pub/Sub).
- No authentication/authorization is implemented (suitable for demo purposes).
- Images are loaded from Unsplash; replace with your own assets as needed.

## License

MIT