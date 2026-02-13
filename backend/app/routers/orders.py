from fastapi import APIRouter, HTTPException
from typing import List
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.OrderResponse])
async def read_orders():
    return await crud.get_all_orders_()

@router.post("/", response_model=schemas.OrderResponse, status_code=201)
async def create_order(order: schemas.OrderCreate):
    return await crud.create_order(order)

@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def read_order(order_id: int):
    db_order = await crud.get_order_(order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.patch("/{order_id}", response_model=schemas.OrderResponse)
async def update_order(order_id: int, order_update: schemas.OrderUpdate):
    db_order = await crud.update_order_(order_id, order_update)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order_update.status:
        await crud.notify_order_status_change(order_id, order_update.status)
    return db_order