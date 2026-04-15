import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data.data || []);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Please login first'); return; }
    const isInWishlist = wishlist.some((item) => item._id === productId);
    try {
      if (isInWishlist) {
        const res = await wishlistService.removeFromWishlist(productId);
        setWishlist(res.data.data || []);
        toast.success('Removed from wishlist');
      } else {
        const res = await wishlistService.addToWishlist(productId);
        setWishlist(res.data.data || []);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const isWishlisted = (productId) => wishlist.some((item) => item._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
