import { useState } from 'react';
import { MenuList } from './components/MenuList';
import { Cart } from './components/Cart';
import { OrderTracker } from './components/OrderTracker';
import { OrdersList } from './components/OrdersList';
import { CartIcon } from './components/CartIcon';
import { useCart } from './hooks/useCart';

type View = 'menu' | 'orders' | 'tracker';

function App() {
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<View>('menu');
  const { isCartOpen, setCartOpen } = useCart();

  const handleOrderPlaced = (orderId: number) => {
    setActiveOrderId(orderId);
    setCartOpen(false);
    setCurrentView('orders'); // Switch to orders view after placing
  };

  const handleSelectOrder = (orderId: number) => {
    setActiveOrderId(orderId);
    setCurrentView('tracker');
  };

  const handleBackToOrders = () => {
    setActiveOrderId(null);
    setCurrentView('orders');
  };



  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Food Delivery</h1>
          <p>Order management demo</p>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => {
              setCurrentView('menu');
              setActiveOrderId(null);
            }}
            style={{
              background: currentView === 'menu' ? '#646cff' : 'transparent',
              color: currentView === 'menu' ? 'white' : '#646cff',
              border: currentView === 'menu' ? 'none' : '1px solid #646cff',
            }}
          >
            Menu
          </button>
          <button
            onClick={() => {
              setCurrentView('orders');
              setActiveOrderId(null);
            }}
            style={{
              background: currentView === 'orders' ? '#646cff' : 'transparent',
              color: currentView === 'orders' ? 'white' : '#646cff',
              border: currentView === 'orders' ? 'none' : '1px solid #646cff',
            }}
          >
            Orders
          </button>
        </nav>
      </header>

      <CartIcon />

      {isCartOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            maxWidth: '400px',
            height: '100vh',
            background: 'white',
            boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
            zIndex: 999,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          <Cart
            onOrderPlaced={handleOrderPlaced}
            onClose={() => setCartOpen(false)}
          />
        </div>
      )}

      <main style={{ display: 'grid', gap: '2rem' }}>
        {activeOrderId ? (
          <OrderTracker orderId={activeOrderId} onBack={handleBackToOrders} />
        ) : currentView === 'menu' ? (
          <MenuList />
        ) : (
          <OrdersList onSelectOrder={handleSelectOrder} />
        )}
      </main>
    </>
  );
}

export default App;