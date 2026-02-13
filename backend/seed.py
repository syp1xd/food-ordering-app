import asyncio
from app import crud, schemas

async def seed_menu():
    existing = await crud.get_all_menu_items()
    if len(existing) > 0:
        print("Menu already seeded")
        return

    menu_items = [
        {
            "name": "Margherita Pizza",
            "description": "Classic cheese and tomato pizza",
            "price": "12.99",
            "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
        },
        {
            "name": "Cheeseburger",
            "description": "Juicy beef patty with cheese",
            "price": "8.99",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
        },
        {
            "name": "Caesar Salad",
            "description": "Fresh romaine with Caesar dressing",
            "price": "6.99",
            "image_url": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400"
        },
        {
            "name": "Sushi Platter",
            "description": "Assorted fresh sushi",
            "price": "15.99",
            "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400"
        },
        {
            "name": "Pasta Carbonara",
            "description": "Creamy Italian pasta",
            "price": "11.99",
            "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400"
        },
    ]

    for item in menu_items:
        await crud.create_menu_item(schemas.MenuItemCreate(**item))

    print("Seeded menu items")

if __name__ == "__main__":
    asyncio.run(seed_menu())