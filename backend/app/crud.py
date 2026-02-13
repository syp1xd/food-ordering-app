from .database import AsyncSessionLocal
from sqlalchemy import text
from . import schemas

async def _get_next_id(table: str) -> int:
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(f"SELECT MAX(id) FROM {table}"))
        max_id = result.scalar()
        return (max_id or 0) + 1

async def create_menu_item(item: schemas.MenuItemCreate):
    item_id = await _get_next_id("menu_items")
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("INSERT INTO menu_items (id, name, description, price, image_url) VALUES (:id, :name, :description, :price, :image_url)"),
            {
                "id": item_id,
                "name": item.name,
                "description": item.description or "",
                "price": str(item.price),
                "image_url": item.image_url or ""
            }
        )
        await session.commit()
    return await get_menu_item(item_id)

async def get_all_menu_items_():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT * FROM menu_items"))
        rows = result.fetchall()
        return [
            {
                "id": row[0],
                "name": row[1],
                "description": row[2] if row[2] else None,
                "price": float(row[3]),
                "image_url": row[4] if row[4] else None
            }
            for row in rows
        ]

async def get_menu_item(item_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT * FROM menu_items WHERE id = :id"),
            {"id": item_id}
        )
        row = result.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2] if row[2] else None,
            "price": float(row[3]),
            "image_url": row[4] if row[4] else None
        }

async def get_menu_item_(item_id: int):
    return await get_menu_item(item_id)

async def get_all_orders_():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("""
            SELECT o.id, o.customer_name, o.address, o.phone, o.status,
                   oi.id as order_item_id, oi.menu_item_id, oi.quantity,
                   mi.name, mi.description, mi.price, mi.image_url
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            ORDER BY o.id, oi.id
        """))
        rows = result.fetchall()
        orders_dict = {}
        for row in rows:
            order_id = row[0]
            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    "id": order_id,
                    "customer_name": row[1],
                    "address": row[2],
                    "phone": row[3],
                    "status": row[4],
                    "items": []
                }
            if row[5] is not None:  # order_item_id exists
                orders_dict[order_id]["items"].append({
                    "id": row[5],
                    "menu_item_id": row[6],
                    "quantity": row[7],
                    "menu_item": {
                        "id": row[6],
                        "name": row[8],
                        "description": row[9],
                        "price": float(row[10]) if row[10] else 0.0,
                        "image_url": row[11]
                    }
                })
        return list(orders_dict.values())

async def get_order(order_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT o.id, o.customer_name, o.address, o.phone, o.status,
                       oi.id as order_item_id, oi.menu_item_id, oi.quantity,
                       mi.name as menu_name, mi.description as menu_description, 
                       mi.price as menu_price, mi.image_url as menu_image_url
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE o.id = :id
                ORDER BY oi.id
            """),
            {"id": order_id}
        )
        rows = result.fetchall()
        if not rows:
            return None
        
        order_data = {
            "id": rows[0][0],
            "customer_name": rows[0][1],
            "address": rows[0][2],
            "phone": rows[0][3],
            "status": rows[0][4],
            "items": []
        }
        
        for row in rows:
            if row[5] is not None:  # order_item_id exists
                order_data["items"].append({
                    "id": row[5],
                    "menu_item_id": row[6],
                    "quantity": row[7],
                    "menu_item": {
                        "id": row[6],
                        "name": row[8],
                        "description": row[9],
                        "price": float(row[10]) if row[10] else 0.0,
                        "image_url": row[11]
                    }
                })
        
        return order_data

async def get_order_(order_id: int):
    return await get_order(order_id)

async def create_order(order: schemas.OrderCreate):
    order_id = await _get_next_id("orders")
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("INSERT INTO orders (id, customer_name, address, phone, status) VALUES (:id, :customer_name, :address, :phone, :status)"),
            {
                "id": order_id,
                "customer_name": order.customer_name,
                "address": order.address,
                "phone": order.phone,
                "status": "received"
            }
        )
        for item in order.items:
            await session.execute(
                text("INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (:order_id, :menu_item_id, :quantity)"),
                {
                    "order_id": order_id,
                    "menu_item_id": item.menu_item_id,
                    "quantity": item.quantity
                }
            )
        await session.commit()
    return await get_order(order_id)

async def update_order_(order_id: int, order_update: schemas.OrderUpdate):
    if order_update.status:
        async with AsyncSessionLocal() as session:
            await session.execute(
                text("UPDATE orders SET status = :status WHERE id = :id"),
                {"status": order_update.status, "id": order_id}
            )
            await session.commit()
    return await get_order(order_id)

async def notify_order_status_change(order_id: int, status: str):
    from .sse import notify_subscribers
    await notify_subscribers(order_id, status)

