from fastapi import APIRouter, HTTPException
from typing import List
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.MenuItemResponse])
async def read_menu():
    return await crud.get_all_menu_items_()

@router.post("/", response_model=schemas.MenuItemResponse, status_code=201)
async def create_menu_item(item: schemas.MenuItemCreate):
    return await crud.create_menu_item(item)