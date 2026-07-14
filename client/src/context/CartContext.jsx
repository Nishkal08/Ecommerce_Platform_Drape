import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const undoTimerRef = useRef(null);

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
      setCartOpen(true); // Open cart drawer on success
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const updateItem = async (itemId, quantity) => {
    setUpdatingItemId(itemId);
    try {
      const res = await cartService.updateCartItem(itemId, { quantity });
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const updateItemSize = async (itemId, size) => {
    setUpdatingItemId(itemId);
    try {
      const res = await cartService.updateCartItem(itemId, { size });
      setCart(res.data.data);
      toast.success('Size updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update size');
    } finally {
      setUpdatingItemId(null);
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

  // Undo-capable remove: optimistically hides item, gives 5s to undo
  const removeItemWithUndo = (itemId) => {
    const itemToRemove = cart.items.find(i => i._id === itemId);
    if (!itemToRemove) return;

    // Optimistically remove from UI
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => i._id !== itemId)
    }));

    // Clear any previous undo timer
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    // Show toast with undo button
    toast((t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-sans)' }}>
        <span style={{ fontSize: '13px' }}>Item removed</span>
        <button
          onClick={() => {
            // Restore item
            setCart(prev => ({
              ...prev,
              items: [...prev.items, itemToRemove]
            }));
            clearTimeout(undoTimerRef.current);
            toast.dismiss(t.id);
          }}
          style={{
            background: 'none',
            border: '1px solid currentColor',
            color: 'var(--accent, #B05C42)',
            padding: '4px 12px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });

    // Actually delete after 5 seconds
    undoTimerRef.current = setTimeout(async () => {
      try {
        await cartService.removeCartItem(itemId);
      } catch (err) {
        // If API fails, restore
        setCart(prev => ({
          ...prev,
          items: [...prev.items, itemToRemove]
        }));
        toast.error('Failed to remove item');
      }
    }, 5000);
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
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      addItem, updateItem, updateItemSize, removeItem, removeItemWithUndo,
      clearAllItems, fetchCart, updatingItemId,
      isCartOpen, setCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
