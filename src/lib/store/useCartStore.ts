
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/lib/types';

interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  setCartItems: (items: CartItem[]) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

/**
 * useCartStore - High-Fidelity Cart Management
 * Uses Zustand with 'persist' middleware to ensure the shopping bag
 * survives page refreshes via localStorage.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      setCartItems: (items) => set({ cartItems: items }),

      addToCart: (product, quantity, selectedSize, selectedColor) => {
        const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
        const items = get().cartItems;
        const existingItem = items.find((item) => item.id === cartItemId);

        if (existingItem) {
          set({
            cartItems: items.map((item) =>
              item.id === cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cartItems: [
              ...items,
              {
                id: cartItemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.images[0],
                slug: product.slug,
                size: selectedSize || 'OS',
                color: selectedColor || 'Default',
              },
            ],
          });
        }
      },

      removeFromCart: (itemId) => {
        set({
          cartItems: get().cartItems.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId, newQuantity) => {
        if (newQuantity < 1) {
          get().removeFromCart(itemId);
          return;
        }
        set({
          cartItems: get().cartItems.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          ),
        });
      },

      clearCart: () => set({ cartItems: [] }),

      totalItems: () => get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: () => get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'mavazi-cart-storage', // Key for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
