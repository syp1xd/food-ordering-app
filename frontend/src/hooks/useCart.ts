import { create } from 'zustand';
import { MenuItem } from '../services/api';

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  total: number;
  itemCount: number;
}

export const useCart = create<CartStore>((set) => {
  const calculateTotal = (cart: CartItem[]) =>
    cart.reduce((sum, ci) => sum + ci.menu_item.price * ci.quantity, 0);

  const calculateItemCount = (cart: CartItem[]) =>
    cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return {
    cart: [],
    isCartOpen: false,
    addToCart: (item, quantity = 1) =>
      set((state) => {
        const existing = state.cart.find(ci => ci.menu_item.id === item.id);
        let newCart;
        if (existing) {
          newCart = state.cart.map(ci =>
            ci.menu_item.id === item.id
              ? { ...ci, quantity: ci.quantity + quantity }
              : ci
          );
        } else {
          newCart = [...state.cart, { menu_item: item, quantity }];
        }
        return {
          cart: newCart,
          total: calculateTotal(newCart),
          itemCount: calculateItemCount(newCart),
        };
      }),
    removeFromCart: (itemId) =>
      set((state) => {
        const newCart = state.cart.filter(ci => ci.menu_item.id !== itemId);
        return {
          cart: newCart,
          total: calculateTotal(newCart),
          itemCount: calculateItemCount(newCart),
        };
      }),
    updateQuantity: (itemId, quantity) =>
      set((state) => {
        if (quantity <= 0) {
          const newCart = state.cart.filter(ci => ci.menu_item.id !== itemId);
          return {
            cart: newCart,
            total: calculateTotal(newCart),
            itemCount: calculateItemCount(newCart),
          };
        }
        const newCart = state.cart.map(ci =>
          ci.menu_item.id === itemId ? { ...ci, quantity } : ci
        );
        return {
          cart: newCart,
          total: calculateTotal(newCart),
          itemCount: calculateItemCount(newCart),
        };
      }),
    clearCart: () =>
      set({
        cart: [],
        total: 0,
        itemCount: 0,
      }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    setCartOpen: (open) => set({ isCartOpen: open }),
    total: 0,
    itemCount: 0,
  };
});