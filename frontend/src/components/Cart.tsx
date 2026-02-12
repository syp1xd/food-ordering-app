import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { ordersApi } from '../services/api';
import { OrderCreate } from '../services/api';

interface CartProps {
  onOrderPlaced: (orderId: number) => void;
  onClose?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onOrderPlaced, onClose }) => {
  const { cart, updateQuantity, total, clearCart } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      const orderData: OrderCreate = {
        customer_name: customerName,
        address,
        phone,
        items: cart.map(ci => ({
          menu_item_id: ci.menu_item.id,
          quantity: ci.quantity,
        })),
      };
      const order = await ordersApi.create(orderData);
      clearCart();
      setCheckout(false);
      onOrderPlaced(order.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkout) {
    return (
      <div className="card">
        {onClose && (
          <button
            onClick={() => {
              setCheckout(false);
              onClose?.();
            }}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Address</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Placing...' : 'Place Order'}
            </button>
            <button type="button" onClick={() => setCheckout(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      {onClose && (
        <button
          onClick={() => {
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}
      <h2>Cart ({cart.reduce((sum, ci) => sum + ci.quantity, 0)} items)</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map(ci => (
            <div key={ci.menu_item.id} className="cart-item">
              <div>
                <strong>{ci.menu_item.name}</strong>
                <div>${ci.menu_item.price.toFixed(2)} each</div>
              </div>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(ci.menu_item.id, ci.quantity - 1)}>
                  -
                </button>
                <span>{ci.quantity}</span>
                <button onClick={() => updateQuantity(ci.menu_item.id, ci.quantity + 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            Total: ${total.toFixed(2)}
          </div>
          <button
            className="primary"
            onClick={() => setCheckout(true)}
            style={{ marginTop: '1rem' }}
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
};