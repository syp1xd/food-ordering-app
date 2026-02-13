import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { ordersApi } from '../services/api';

interface CartProps {
  onOrderPlaced: (orderId: number) => void;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ onOrderPlaced, onClose }) => {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleCheckout = async () => {
    setIsOrdering(true);
    try {
      const order = await ordersApi.create({
        customer_name: 'Guest User',
        phone: '555-0123',
        address: '123 Main St',
        items: cart.map((item) => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      onOrderPlaced(order.id);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="empty-state">
          <span className="icon">🛒</span>
          <p>Your cart is empty</p>
          <button onClick={onClose} className="secondary-btn">Start Ordering</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-drawer">
      <div className="cart-header">
        <h2>Your Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})</h2>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.menu_item.id} className="cart-item slide-in">
            <div className="item-info">
              <h4>{item.menu_item.name}</h4>
              <p className="price">${Number(item.menu_item.price).toFixed(2)} x {item.quantity}</p>
            </div>
            <div className="item-actions">
              <span className="item-total">${(item.menu_item.price * item.quantity).toFixed(2)}</span>
              <button 
                onClick={() => removeFromCart(item.menu_item.id)}
                className="remove-btn"
                title="Remove item"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-summary">
          <div className="row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>Tax (8%)</span>
            <span>${(total * 0.08).toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>${(total * 1.08).toFixed(2)}</span>
          </div>
        </div>

        <button 
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={isOrdering}
        >
          {isOrdering ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};
