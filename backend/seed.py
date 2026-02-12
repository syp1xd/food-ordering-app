from app.database import engine, SessionLocal
from app import models

def seed_menu():
    db = SessionLocal()
    try:
        if db.query(models.MenuItem).count() == 0:
            menu_items = [
                models.MenuItem(
                    name="Margherita Pizza",
                    description="Classic cheese and tomato pizza",
                    price=12.99,
                    image_url="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
                ),
                models.MenuItem(
                    name="Cheeseburger",
                    description="Juicy beef patty with cheese",
                    price=8.99,
                    image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
                ),
                models.MenuItem(
                    name="Caesar Salad",
                    description="Fresh romaine with Caesar dressing",
                    price=6.99,
                    image_url="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400"
                ),
                models.MenuItem(
                    name="Sushi Platter",
                    description="Assorted fresh sushi",
                    price=15.99,
                    image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400"
                ),
                models.MenuItem(
                    name="Pasta Carbonara",
                    description="Creamy Italian pasta",
                    price=11.99,
                    image_url="https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400"
                ),
            ]
            db.add_all(menu_items)
            db.commit()
            print("Seeded menu items")
        else:
            print("Menu already seeded")
    finally:
        db.close()

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    seed_menu()