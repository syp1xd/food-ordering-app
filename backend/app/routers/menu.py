from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.MenuItemResponse])
async def read_menu(db: AsyncSession = Depends(get_db)):
    return await crud.get_all_menu_items(db)

@router.post("/", response_model=schemas.MenuItemResponse, status_code=201)
async def create_menu_item(item: schemas.MenuItemCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_menu_item(db, item)