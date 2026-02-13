import { useState } from 'react';
import { MenuList } from './components/MenuList';
import { Cart } from './components/Cart';
import { OrderTracker } from './components/OrderTracker';
import { OrdersList } from './components/OrdersList.tsx';
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
    setCurrentView('tracker');
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
      <header className="header-nav fade-in">
        <div className="brand">
          <h1>Food Delivery</h1>
          <p>Order management demo</p>
        </div>
        <nav className="nav-buttons">
          <button
            onClick={() => {
              setCurrentView('menu');
              setActiveOrderId(null);
            }}
            className={currentView === 'menu' ? 'primary' : 'outline'}
          >
            Menu
          </button>
          <button
            onClick={() => {
              setCurrentView('orders');
              setActiveOrderId(null);
            }}
            className={currentView === 'orders' ? 'primary' : 'outline'}
          >
            My Orders
          </button>
          <CartIcon />
        </nav>
      </header>

      {isCartOpen && (
        <div className="cart-overlay fade-in">
          <div className="cart-backdrop" onClick={() => setCartOpen(false)} />
          <div className="cart-panel slide-in">
            <Cart onOrderPlaced={handleOrderPlaced} onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}

      <main className="container fade-in" style={{ animationDelay: '0.1s' }}>
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
