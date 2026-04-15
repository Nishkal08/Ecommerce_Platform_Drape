import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [] }); return; }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.data || { items: [] });
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1, size = '') => {
    if (!user) { toast.error('Please login to add items'); return; }
    try {
      const res = await cartService.addToCart({ productId, quantity, size });
      setCart(res.data.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await cartService.updateCartItem(itemId, { quantity });
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartService.removeCartItem(itemId);
      setCart(res.data.data);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const clearAllItems = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [] });
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, cartCount, cartTotal, addItem, updateItem, removeItem, clearAllItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
