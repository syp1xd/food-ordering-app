import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';
import { MenuItem } from '../services/api';

const mockItem: MenuItem = {
  id: 1,
  name: 'Pizza',
  description: 'Cheesy',
  price: 9.99,
  image_url: null,
};

const mockItem2: MenuItem = {
  id: 2,
  name: 'Burger',
  description: 'Juicy',
  price: 7.99,
  image_url: null,
};

describe('useCart', () => {
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].menu_item.id).toBe(1);
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('increases quantity when adding same item', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.addToCart(mockItem);
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('adds different items separately', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.addToCart(mockItem2);
    });
    expect(result.current.cart).toHaveLength(2);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.removeFromCart(1);
    });
    expect(result.current.cart).toHaveLength(0);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.updateQuantity(1, 5);
    });
    expect(result.current.cart[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.updateQuantity(1, 0);
    });
    expect(result.current.cart).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem, 2);
      result.current.addToCart(mockItem2, 1);
    });
    expect(result.current.total).toBeCloseTo(9.99 * 2 + 7.99);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addToCart(mockItem);
      result.current.addToCart(mockItem2);
      result.current.clearCart();
    });
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});