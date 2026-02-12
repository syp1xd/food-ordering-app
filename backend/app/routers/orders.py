from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.OrderResponse])
async def read_orders(db: AsyncSession = Depends(get_db)):
    return await crud.get_all_orders(db)

@router.post("/", response_model=schemas.OrderResponse, status_code=201)
async def create_order(order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_order(db, order)

@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def read_order(order_id: int, db: AsyncSession = Depends(get_db)):
    db_order = await crud.get_order(db, order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.patch("/{order_id}", response_model=schemas.OrderResponse)
async def update_order(order_id: int, order_update: schemas.OrderUpdate, db: AsyncSession = Depends(get_db)):
    db_order = await crud.update_order(db, order_id, order_update)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order_update.status:
        await crud.notify_order_status_change(order_id, order_update.status)
    return db_order