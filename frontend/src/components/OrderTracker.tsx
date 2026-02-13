import React, { useEffect, useRef, useState } from 'react';
import { ordersApi, sseApi, Order } from '../services/api';

interface OrderTrackerProps {
  orderId: number;
  onBack: () => void;
}

const statusLabels: Record<string, string> = {
  received: 'Received',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const steps: Array<Order['status']> = ['received', 'preparing', 'out_for_delivery', 'delivered'];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getOne(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = sseApi.streamOrderStatus(orderId);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.order_id === orderId) {
          setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
        }
      } catch (e) {
        console.error('SSE parse error', e);
      }
    };

    es.onerror = () => {
      es.close();
      reconnectTimeoutRef.current = window.setTimeout(connectSSE, 3000);
    };
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await fetchOrder();
    };

    load();
    connectSSE();

    const pollInterval = window.setInterval(fetchOrder, 5000);

    return () => {
      mounted = false;
      window.clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Order not found</p>
        <button onClick={onBack} className="primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = steps.indexOf(order.status);
  const total = order.items.reduce((sum, oi) => sum + oi.menu_item.price * oi.quantity, 0);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Order #{order.id}</h2>
          <p style={{ marginTop: '0.35rem' }}>Track your order in real-time</p>
        </div>
        <span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span>
      </div>

      <div className="stepper">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={`step ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
          >
            <div className="step-circle">{idx < currentStepIndex ? '✓' : idx + 1}</div>
            <div className="step-label">{statusLabels[step]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {order.items.map((oi) => (
          <div key={oi.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <strong>{oi.menu_item.name}</strong>
              <div style={{ opacity: 0.75 }}>Qty: {oi.quantity}</div>
            </div>
            <div style={{ fontWeight: 700 }}>${(oi.menu_item.price * oi.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button onClick={onBack} className="outline" style={{ marginTop: '1.25rem' }}>
        Back to Orders
      </button>
    </div>
  );
};
