import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, get_db
from app import models
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Order Management API"}

def test_get_empty_menu():
    response = client.get("/api/menu/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_menu_item():
    item = {"name": "Test Pizza", "description": "A test pizza", "price": 9.99}
    response = client.post("/api/menu/", json=item)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Test Pizza"

def test_get_orders_empty():
    response = client.get("/api/orders/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_order_requires_items():
    order = {"customer_name": "John", "address": "123 Main", "phone": "555-1234", "items": []}
    response = client.post("/api/orders/", json=order)
    assert response.status_code == 422

def test_create_order_invalid_item():
    order = {"customer_name": "John", "address": "123 Main", "phone": "555-1234", "items": [{"menu_item_id": 999, "quantity": 1}]}
    response = client.post("/api/orders/", json=order)
    assert response.status_code == 400

def test_create_order_success():
    # create menu item first
    menu_item = {"name": "Burger", "description": "Cheesy", "price": 7.99}
    client.post("/api/menu/", json=menu_item)
    order = {"customer_name": "Alice", "address": "456 Elm", "phone": "555-5678", "items": [{"menu_item_id": 1, "quantity": 2}]}
    response = client.post("/api/orders/", json=order)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "Alice"
    assert data["status"] == "received"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2

def test_get_order_by_id():
    # create menu and order
    client.post("/api/menu/", json={"name": "Pizza", "price": 10.0})
    order_data = {"customer_name": "Bob", "address": "789 Oak", "phone": "555-9999", "items": [{"menu_item_id": 1, "quantity": 1}]}
    create_resp = client.post("/api/orders/", json=order_data)
    order_id = create_resp.json()["id"]
    response = client.get(f"/api/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["id"] == order_id

def test_update_order_status():
    client.post("/api/menu/", json={"name": "Salad", "price": 5.0})
    order_data = {"customer_name": "Carol", "address": "101 Pine", "phone": "555-1111", "items": [{"menu_item_id": 1, "quantity": 1}]}
    create_resp = client.post("/api/orders/", json=order_data)
    order_id = create_resp.json()["id"]
    patch_resp = client.patch(f"/api/orders/{order_id}", json={"status": "preparing"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "preparing"