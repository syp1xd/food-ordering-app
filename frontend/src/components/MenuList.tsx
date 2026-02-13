import React, { useEffect, useState } from 'react';
import { menuApi, MenuItem } from '../services/api';
import { useCart } from '../hooks/useCart';

export const MenuList: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi.getAll()
      .then(setMenu)
      .catch(err => console.error('Failed to load menu:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2>Menu</h2>
        <div className="menu-grid">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="skeleton-card" style={{ height: '360px' }}></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Menu</h2>
      <div className="menu-grid">
        {menu.map(item => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

const MenuCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="card menu-item">
      {item.image_url && (
        <img src={item.image_url} alt={item.name} loading="lazy" />
      )}
      <div className="menu-item-content">
        <div>
          <h3>{item.name}</h3>
          <p className="description">{item.description}</p>
        </div>
        <div className="menu-item-action">
          <div className="price">${item.price.toFixed(2)}</div>
          <button
            className={added ? 'outline' : 'primary'}
            onClick={handleAdd}
            disabled={added}
          >
            {added ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
