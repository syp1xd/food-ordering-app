from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from . import models, schemas

async def get_all_menu_items(db: AsyncSession):
    result = await db.execute(select(models.MenuItem))
    return result.scalars().all()

async def get_menu_item(db: AsyncSession, item_id: int):
    result = await db.execute(select(models.MenuItem).where(models.MenuItem.id == item_id))
    return result.scalar_one_or_none()

async def create_menu_item(db: AsyncSession, item: schemas.MenuItemCreate):
    db_item = models.MenuItem(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def get_all_orders(db: AsyncSession):
    result = await db.execute(
        select(models.Order).options(selectinload(models.Order.items)).order_by(models.Order.id.desc())
    )
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items).selectinload(models.OrderItem.menu_item))
        .where(models.Order.id == order_id)
    )
    return result.scalar_one_or_none()

async def create_order(db: AsyncSession, order: schemas.OrderCreate):
    db_order = models.Order(
        customer_name=order.customer_name,
        address=order.address,
        phone=order.phone
    )
    db.add(db_order)
    await db.flush()

    for item in order.items:
        menu_item = await get_menu_item(db, item.menu_item_id)
        if not menu_item:
            raise ValueError(f"Menu item {item.menu_item_id} not found")
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity
        )
        db.add(db_order_item)

    await db.commit()
    # Reload with relationships
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items).selectinload(models.OrderItem.menu_item))
        .where(models.Order.id == db_order.id)
    )
    return result.scalar_one()

async def update_order(db: AsyncSession, order_id: int, order_update: schemas.OrderUpdate):
    db_order = await get_order(db, order_id)
    if not db_order:
        return None
    if order_update.status is not None:
        db_order.status = order_update.status
    await db.commit()
    # Reload with relationships
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items).selectinload(models.OrderItem.menu_item))
        .where(models.Order.id == order_id)
    )
    return result.scalar_one_or_none()

async def notify_order_status_change(order_id: int, status: str):
    from .sse import notify_subscribers
    await notify_subscribers(order_id, status)