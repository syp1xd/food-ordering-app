import React, { useEffect, useMemo, useState } from 'react';
import { ordersApi, Order } from '../services/api';

interface OrdersListProps {
  onSelectOrder: (orderId: number) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getAll()
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalsById = useMemo(() => {
    const map = new Map<number, number>();
    for (const order of orders) {
      const total = order.items.reduce(
        (sum, oi) => sum + oi.menu_item.price * oi.quantity,
        0
      );
      map.set(order.id, total);
    }
    return map;
  }, [orders]);

  if (loading) {
    return (
      <div className="orders-container">
        <h2>My Orders</h2>
        <div className="orders-skeleton">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-card" style={{ height: '100px', marginBottom: '1rem' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container fade-in">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders yet. Start ordering some delicious food!</p>
        </div>
      ) : (
        <div className="menu-grid">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="card"
              onClick={() => onSelectOrder(order.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                  <p style={{ marginTop: '0.25rem' }}>
                    {order.items.slice(0, 2).map((oi) => `${oi.quantity}× ${oi.menu_item.name}`).join(' • ')}
                    {order.items.length > 2 ? ` • +${order.items.length - 2} more` : ''}
                  </p>
                </div>
                <div style={{ display: 'grid', justifyItems: 'end', gap: '0.5rem' }}>
                  <span className={`status-badge status-${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-color)' }}>
                    ${Number(totalsById.get(order.id) ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
