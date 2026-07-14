import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineLockClosed, HiOutlineRefresh, HiOutlineHeart, HiOutlineTruck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { validateCoupon } from '../services/couponService';
import { getProducts } from '../services/productService';
import { formatPrice } from '../utils/formatPrice';
import ProductCard from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

// Helper: compute estimated delivery date (5–7 business days from now)
const getEstimatedDelivery = () => {
  const d = new Date();
  let biz = 0;
  const target = 5 + Math.floor(Math.random() * 3); // 5-7 days
  while (biz < target) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) biz++;
  }
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
};

const CartPage = () => {
  const {
    cart, cartTotal, updateItem, updateItemSize,
    removeItemWithUndo, clearAllItems, updatingItemId
  } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showPromo, setShowPromo] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [estimatedDate] = useState(getEstimatedDelivery());

  // Load "Complete the Look" products
  useEffect(() => {
    const loadRecs = async () => {
      try {
        const res = await getProducts({ limit: 8 });
        const all = res.data.data.products || [];
        const cartIds = (cart.items || []).map(i => i.product?._id);
        const filtered = all.filter(p => !cartIds.includes(p._id)).slice(0, 6);
        setRecommendations(filtered);
      } catch { /* silent */ }
    };
    loadRecs();
  }, [cart.items]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: cartTotal });
      setCouponDiscount(res.data.data.discount);
      setAppliedCoupon(res.data.data);
      toast.success(`Coupon applied! You save ${formatPrice(res.data.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to proceed to checkout');
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/checkout', {
      state: {
        couponApplied: appliedCoupon
          ? { code: appliedCoupon.code, discount: couponDiscount }
          : null
      }
    });
  };

  const handleSaveForLater = async (item) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    await toggleWishlist(item.product._id);
    removeItemWithUndo(item._id);
  };

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb__separator">/</span>
            <span>Cart</span>
          </div>
          <div className="empty-state">
            <div className="empty-state__icon">🛍️</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn--primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-[#FAF9F6]">
      <div className="page-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__separator">/</span>
          <span>Cart</span>
        </div>

        {/* Page Header */}
        <div className="page-header--editorial">
          <h1>Shopping Cart</h1>
          <span className="page-header__meta">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {/* Stitch line divider (#2) */}
        <hr className="divider--stitch" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Cart Items List */}
          <div className="flex-1 w-full min-w-0">
            {cart.items.map((item) => {
              const priceDiff = item.priceAtAdd && item.product?.price
                ? item.priceAtAdd - item.product.price
                : 0;

              return (
                <div key={item._id} className="flex gap-6 py-6 border-b border-black/5 relative">
                  {/* Loading overlay (#18) */}
                  {updatingItemId === item._id && (
                    <div className="absolute inset-0 bg-[#FAF9F6]/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="spinner-small" />
                    </div>
                  )}

                  {/* Left: Product Image */}
                  <Link to={`/products/${item.product?.slug}`} className="w-24 h-32 md:w-28 md:h-36 bg-black/[0.02] overflow-hidden flex-shrink-0 border border-black/5">
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      {/* Category */}
                      <div className="text-[10px] font-sans font-semibold tracking-wider text-black/35 uppercase">
                        {item.product?.category || 'Women'}
                      </div>
                      {/* Title */}
                      <Link to={`/products/${item.product?.slug}`} className="font-sans text-sm font-bold text-charcoal tracking-wide mt-0.5 hover:underline block truncate">
                        {item.product?.name}
                      </Link>
                      {/* Sub-description (Fabric info fallback) */}
                      <div className="text-[11px] font-sans text-black/40 mt-1 uppercase tracking-wider">
                        {item.product?.fabric || '100% Merino Wool'}
                      </div>

                      {/* Size Selector */}
                      <div className="text-[11px] font-sans text-black/50 mt-1.5 uppercase font-medium flex items-center gap-1.5">
                        <span>Size:</span>
                        {item.product?.sizes?.length > 0 ? (
                          <select
                            className="bg-transparent border-none p-0 pr-4 font-bold text-charcoal cursor-pointer outline-none font-sans uppercase tracking-wider"
                            value={item.size || ''}
                            onChange={(e) => updateItemSize(item._id, e.target.value)}
                            aria-label={`Change size for ${item.product?.name}`}
                          >
                            {item.product.sizes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-bold text-charcoal">{item.size || 'FREE'}</span>
                        )}
                      </div>
                    </div>

                    {/* Controls (Stepper, Save, Remove) */}
                    <div className="flex items-center gap-6 mt-4 flex-wrap">
                      {/* Stepper */}
                      <div className="flex items-center border border-black/10 rounded-md bg-[#FAF9F6] h-8 text-xs overflow-hidden">
                        <button
                          onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}
                          className="px-3 h-full hover:bg-black/5 transition-colors font-medium border-none bg-transparent cursor-pointer"
                          aria-label={`Decrease quantity of ${item.product?.name}`}
                        >−</button>
                        <span className="px-2 font-medium min-w-[24px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="px-3 h-full hover:bg-black/5 transition-colors font-medium border-none bg-transparent cursor-pointer"
                          aria-label={`Increase quantity of ${item.product?.name}`}
                        >+</button>
                      </div>

                      {/* Save for later */}
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="text-[11px] font-sans font-bold tracking-wider uppercase text-black/40 hover:text-charcoal transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                        title="Move to wishlist"
                        aria-label={`Save ${item.product?.name} for later`}
                      >
                        <HiOutlineHeart size={14} /> Save For Later
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeItemWithUndo(item._id)}
                        className="text-[11px] font-sans font-bold tracking-wider uppercase text-black/40 hover:text-red-500 transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                        title="Remove item"
                        aria-label={`Remove ${item.product?.name} from cart`}
                      >
                        <HiOutlineTrash size={14} /> Remove
                      </button>
                    </div>

                    {/* Urgency indicators */}
                    <div className="mt-3.5 space-y-1.5">
                      {priceDiff > 0 && (
                        <div className="text-[11px] font-sans font-semibold text-green-600 uppercase tracking-wide">
                          ↓ Price dropped {formatPrice(priceDiff)} since added
                        </div>
                      )}
                      {item.product?.stock > 0 && item.product.stock <= 5 && (
                        <div className="text-[11px] font-sans font-semibold text-red-500 uppercase tracking-wide">
                          Only {item.product.stock} pieces left in stock
                        </div>
                      )}
                      <div className="text-[11px] font-sans text-black/40 flex items-center gap-1.5 uppercase tracking-wider">
                        <HiOutlineTruck size={13} /> Arrives by {estimatedDate}
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Price */}
                  <div className="text-right flex flex-col justify-start py-1">
                    <span className="font-sans text-sm font-bold text-charcoal tracking-wide">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Layout Footer Controls */}
            <div className="flex gap-4 mt-8">
              <button onClick={clearAllItems} className="btn btn--destructive-muted btn--sm text-[10px] tracking-wider uppercase font-bold py-2.5 px-6">
                Clear Cart
              </button>
              <Link to="/products" className="btn btn--outline btn--sm text-[10px] tracking-wider uppercase font-bold py-2.5 px-6" style={{ textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>

            {/* Complete the Look Section */}
            {recommendations.length > 0 && (
              <div className="mt-16">
                <hr className="divider--stitch" />
                <h3 className="font-sans text-[11px] font-bold tracking-widest uppercase text-black/45 mb-8">
                  Complete the Silhouette
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {recommendations.map(p => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Sticky Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="sticky-sidebar space-y-6">
              {/* Summary Card */}
              <div className="bg-[#EAE6DC]/35 p-8 rounded-lg border border-black/5 flex flex-col">
                <h3 className="font-sans text-xs font-bold tracking-widest uppercase text-charcoal border-b border-black/5 pb-4 mb-6">
                  Summary
                </h3>

                <div className="flex justify-between items-center text-xs text-black/50 mb-4">
                  <span>Subtotal</span>
                  <span className="font-sans font-bold text-charcoal">{formatPrice(cartTotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600 mb-4">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-sans font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-black/50 mb-4">
                  <span>Shipping</span>
                  <span className="font-sans font-bold text-green-600 uppercase tracking-wider text-[11px]">Free</span>
                </div>

                <div className="flex justify-between items-center text-xs text-black/50 mb-6">
                  <span>Estimated Delivery</span>
                  <span className="font-sans font-bold text-charcoal">{estimatedDate}</span>
                </div>

                {/* Promo Input Box */}
                <div className="flex border border-black/10 rounded-md bg-white overflow-hidden mb-6 h-10">
                  <input
                    placeholder="Promo Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 bg-transparent border-none outline-none font-sans text-[11px] placeholder-black/30 tracking-wider uppercase font-bold text-charcoal"
                    aria-label="Promo code"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 bg-transparent border-none font-sans text-[10px] font-bold tracking-wider text-charcoal uppercase hover:bg-black/5 cursor-pointer transition-colors border-l border-black/5"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>

                <div className="flex justify-between items-baseline border-t border-black/5 pt-6 mt-2 mb-8">
                  <span className="font-sans text-xs font-bold tracking-widest text-charcoal uppercase">Total</span>
                  <span className="font-sans text-2xl font-bold text-charcoal">
                    {formatPrice(Math.max(cartTotal - couponDiscount, 0))}
                  </span>
                </div>

                <button
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white py-3.5 px-6 rounded-md font-sans text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  onClick={handleCheckout}
                >
                  Secure Checkout &nbsp; →
                </button>

                <div className="text-[10px] font-sans text-black/35 tracking-wider uppercase leading-relaxed text-center mt-6">
                  COMPLIMENTARY SHIPPING ON ARCHIVAL ORDERS OVER ₹15,000. RETURNS ACCEPTED WITHIN 14 DAYS.
                </div>
              </div>

              {/* Secure Info Strip */}
              <div className="trust-strip p-4 bg-white border border-black/5 rounded-lg space-y-3">
                <div className="trust-item flex items-center gap-3 text-xs text-black/50">
                  <HiOutlineLockClosed size={16} />
                  <span>Secure Checkout powered by SSL encryption</span>
                </div>
                <div className="trust-item flex items-center gap-3 text-xs text-black/50">
                  <HiOutlineRefresh size={16} />
                  <span>Complimentary 14-day hassle-free returns</span>
                </div>
                <div className="trust-item flex items-center gap-3 text-xs text-black/50">
                  <HiOutlineTruck size={16} />
                  <span>Free express shipping on all orders</span>
                </div>
              </div>

              {/* Need Help? Block */}
              <div className="help-block p-6 bg-white border border-black/5 rounded-lg">
                <div className="help-block__title font-sans text-xs font-bold tracking-widest uppercase text-charcoal mb-2">Need Help?</div>
                <div className="help-block__text text-xs text-black/40 leading-relaxed mb-4">
                  Our styling experts are here to assist you with sizing, fit, and recommendations.
                </div>
                <Link to="/contact" className="help-block__link text-xs font-bold text-charcoal hover:underline">Contact Support →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
