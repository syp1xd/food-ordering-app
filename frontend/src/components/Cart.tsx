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
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const trimmedName = customerName.trim();
  const trimmedPhone = phone.trim();
  const trimmedAddress = address.trim();

  const isFormValid = trimmedName.length > 0 && trimmedPhone.length > 0 && trimmedAddress.length > 0;

  const handleCheckout = async () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }
    setIsOrdering(true);
    try {
      const order = await ordersApi.create({
        customer_name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        items: cart.map((item) => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setCustomerName('');
      setPhone('');
      setAddress('');
      setShowValidation(false);
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
        <div className="cart-form">
          <h3>Delivery details</h3>
          <div className="field">
            <label>
              Name
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            {showValidation && trimmedName.length === 0 && (
              <div className="field-error">Please enter your name</div>
            )}
          </div>

          <div className="field">
            <label>
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
            {showValidation && trimmedPhone.length === 0 && (
              <div className="field-error">Please enter your phone number</div>
            )}
          </div>

          <div className="field">
            <label>
              Address
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                rows={3}
                autoComplete="street-address"
              />
            </label>
            {showValidation && trimmedAddress.length === 0 && (
              <div className="field-error">Please enter your address</div>
            )}
          </div>
        </div>

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
          disabled={isOrdering || !isFormValid}
        >
          {isOrdering ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};
