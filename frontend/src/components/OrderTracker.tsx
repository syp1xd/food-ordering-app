import React, { useEffect, useState, useRef } from 'react';
import { ordersApi, sseApi, Order } from '../services/api';

interface OrderTrackerProps {
  orderId: number;
  onBack: () => void;
}

const statusLabels: Record<string, string> = {
  received: 'Order Received',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = sseApi.streamOrderStatus(orderId);
    eventSourceRef.current = es;
    console.log('[SSE] Connecting to stream for order', orderId);
    es.onopen = () => {
      console.log('[SSE] Connection opened');
    };
    es.onmessage = (event) => {
      console.log('[SSE] Message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.order_id === orderId) {
          console.log('[SSE] Updating order status to:', data.status);
          // Merge the new status into existing order to preserve all fields
          setOrder(prev => prev ? { ...prev, status: data.status } : prev);
        }
      } catch (e) {
        console.error('SSE parse error', e);
      }
    };
    es.onerror = (err) => {
      console.error('[SSE] Error, will reconnect in 3s:', err);
      es.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = window.setTimeout(connectSSE, 3000);
    };
  };

  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getOne(orderId);
        if (mounted) {
          setOrder(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        if (mounted) setLoading(false);
      }
    };
    fetchOrder();
    connectSSE();

    // Polling fallback: refresh order every 5 seconds to ensure updates
    const pollInterval = setInterval(fetchOrder, 5000);

    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearInterval(pollInterval);
    };
  }, [orderId]);

  if (loading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Order #{order.id}</h2>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #ccc', cursor: 'pointer' }}>
          ← Back to Orders
        </button>
      </div>
      <div>
        <strong>Status:</strong>{' '}
        <span className={`status-badge status-${order.status}`}>
          {statusLabels[order.status]}
        </span>
      </div>
      <h3 style={{ marginTop: '1rem' }}>Items</h3>
      <ul>
        {order.items.map(oi => (
          <li key={oi.id}>
            {oi.menu_item.name} x {oi.quantity} — ${(oi.menu_item.price * oi.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '0.8rem', fontWeight: 'bold' }}>
        Total: ${order.items.reduce((sum, oi) => sum + oi.menu_item.price * oi.quantity, 0).toFixed(2)}
      </div>
      <div style={{ marginTop: '0.8rem', color: '#666' }}>
        <div><strong>Name:</strong> {order.customer_name}</div>
        <div><strong>Address:</strong> {order.address}</div>
        <div><strong>Phone:</strong> {order.phone}</div>
      </div>
    </div>
  );
};