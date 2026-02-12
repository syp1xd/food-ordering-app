import React, { useEffect, useState } from 'react';
import { ordersApi, Order } from '../services/api';

export const OrdersList: React.FC<{ onSelectOrder: (orderId: number) => void }> = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll()
      .then(setOrders)
      .catch(err => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <section>
      <h2>All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="card">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {orders.map(order => (
              <li
                key={order.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectOrder(order.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {order.customer_name} — {order.items.reduce((sum, oi) => sum + oi.quantity, 0)} items
                    </div>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};