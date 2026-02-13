from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers import menu, orders
from .sse import sse_router
from .database import engine, Base
from . import crud, schemas
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Always create tables if they don't exist
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed menu items if table is empty (and not in testing mode)
    if not os.getenv("TESTING"):
        existing = await crud.get_all_menu_items_()
        if len(existing) == 0:
            print("Seeding database with initial menu items...")
            await crud.create_menu_item(schemas.MenuItemCreate(
                name="Margherita Pizza",
                description="Classic cheese and tomato pizza",
                price=12.99,
                image_url="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
            ))
            await crud.create_menu_item(schemas.MenuItemCreate(
                name="Cheeseburger",
                description="Juicy beef patty with cheese",
                price=8.99,
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
            ))
            await crud.create_menu_item(schemas.MenuItemCreate(
                name="Caesar Salad",
                description="Fresh romaine with Caesar dressing",
                price=6.99,
                image_url="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400"
            ))
            await crud.create_menu_item(schemas.MenuItemCreate(
                name="Sushi Platter",
                description="Assorted fresh sushi",
                price=15.99,
                image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400"
            ))
            await crud.create_menu_item(schemas.MenuItemCreate(
                name="Pasta Carbonara",
                description="Creamy Italian pasta",
                price=11.99,
                image_url="https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400"
            ))
            print("Database seeded successfully!")
        else:
            print(f"Database already has {len(existing)} menu items")
    
    yield

app = FastAPI(title="Order Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router, prefix="/api/menu", tags=["menu"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(sse_router, prefix="/api/sse", tags=["sse"])

@app.get("/")
def read_root():
    return {"message": "Order Management API"}