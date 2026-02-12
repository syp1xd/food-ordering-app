import React, { useEffect, useState } from 'react';
import { menuApi, MenuItem } from '../services/api';
import { useCart } from '../hooks/useCart';

export const MenuList: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    menuApi.getAll()
      .then(setMenu)
      .catch(err => console.error('Failed to load menu:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading menu...</div>;

  return (
    <section>
      <h2>Menu</h2>
      <div className="grid">
        {menu.map(item => (
          <div key={item.id} className="card menu-item">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} loading="lazy" />
            )}
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="price">${item.price.toFixed(2)}</div>
              <button
                className="primary"
                onClick={() => addToCart(item)}
                style={{ marginTop: '0.5rem' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};