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
    <div className="page">
      <div className="page-content">
        {/* Header Zone with Visual Rhythm (#8) */}
        <div className="page-header-zone">
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
        </div>

        {/* Stitch line divider (#2) */}
        <hr className="divider--stitch" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="flex-1 w-full">
            {cart.items.map((item) => {
              const priceDiff = item.priceAtAdd && item.product?.price
                ? item.priceAtAdd - item.product.price
                : 0;

              return (
                <div key={item._id} className="cart-row" style={{ position: 'relative' }}>
                  {/* Loading overlay (#18) */}
                  {updatingItemId === item._id && (
                    <div className="cart-row__loading">
                      <div className="spinner-small" />
                    </div>
                  )}

                  <Link to={`/products/${item.product?.slug}`} className="cart-row__image-link">
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      className="cart-row__image"
                    />
                  </Link>

                  <div className="cart-row__info">
                    <Link to={`/products/${item.product?.slug}`} className="cart-row__name">
                      {item.product?.name}
                    </Link>

                    {/* Inline Size Edit (#10) */}
                    {item.product?.sizes?.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="cart-row__meta">Size:</span>
                        <select
                          className="cart-row__size-select"
                          value={item.size || ''}
                          onChange={(e) => updateItemSize(item._id, e.target.value)}
                          aria-label={`Change size for ${item.product?.name}`}
                        >
                          {item.product.sizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      item.size && <span className="cart-row__meta">Size: {item.size}</span>
                    )}

                    <span className="cart-row__price">{formatPrice(item.product?.price)}</span>

                    {/* Price Drop Alert (#14) */}
                    {priceDiff > 0 && (
                      <div className="price-drop-badge">
                        ↓ Price dropped {formatPrice(priceDiff)} since added
                      </div>
                    )}

                    {/* Stock Urgency (#11) */}
                    {item.product?.stock > 0 && item.product.stock <= 5 && (
                      <div className="stock-badge">
                        Only {item.product.stock} left
                      </div>
                    )}

                    {/* Delivery Estimate (#13) */}
                    <div className="delivery-estimate">
                      <HiOutlineTruck style={{ fontSize: '13px' }} />
                      Arrives by {estimatedDate}
                    </div>
                  </div>

                  <div className="cart-row__controls">
                    <div className="qty-stepper--unified">
                      <button
                        onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product?.name}`}
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.product?.name}`}
                      >+</button>
                    </div>

                    {/* Save for Later (#12) */}
                    <button
                      onClick={() => handleSaveForLater(item)}
                      className="cart-row__save-later"
                      title="Move to wishlist"
                      aria-label={`Save ${item.product?.name} for later`}
                    >
                      <HiOutlineHeart style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle', fontSize: '13px' }} />
                      Save
                    </button>

                    {/* Delete with Undo (#9) */}
                    <button
                      onClick={() => removeItemWithUndo(item._id)}
                      className="cart-row__remove"
                      title="Remove item"
                      aria-label={`Remove ${item.product?.name} from cart`}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>

                  <div className="cart-row__total">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </div>
                </div>
              );
            })}

            {/* Button Hierarchy (#6) */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={clearAllItems} className="btn btn--destructive-muted btn--sm">
                Clear Cart
              </button>
              <Link to="/products" className="btn btn--outline btn--sm" style={{ textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>

            {/* Complete the Look (#3b) */}
            {recommendations.length > 0 && (
              <div className="complete-look">
                <hr className="divider--stitch" />
                <h3 className="complete-look__title">Complete the Look</h3>
                <div className="complete-look__strip">
                  {recommendations.map(p => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Order Summary & Trust Strip */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="cart-summary-card--sticky">
              <h3 className="cart-summary-card__title">Order Summary</h3>

              {/* Collapsible Coupon Reveal */}
              <div>
                <button
                  className="promo-toggle-link"
                  onClick={() => setShowPromo(!showPromo)}
                  aria-label={showPromo ? 'Hide promo code input' : 'Show promo code input'}
                  aria-expanded={showPromo}
                >
                  {showPromo ? 'Hide promo code' : 'Have a promo code?'}
                </button>
                <div className={`promo-panel-collapsible ${showPromo ? 'promo-panel-collapsible--open' : ''}`}>
                  <div className="coupon-input-group">
                    <input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      aria-label="Promo code"
                    />
                    <button
                      className="coupon-input-group__btn"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                <span style={{ fontWeight: '500' }}>{formatPrice(cartTotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: 'var(--success)' }}>
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span style={{ fontWeight: '500' }}>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: '500' }}>Free</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Estimated Delivery</span>
                <span style={{ fontWeight: '500' }}>{estimatedDate}</span>
              </div>

              <div className="cart-summary-card__row-total">
                <span>Total</span>
                <span>{formatPrice(Math.max(cartTotal - couponDiscount, 0))}</span>
              </div>

              <button
                className="btn btn--primary btn--full btn--lg"
                onClick={handleCheckout}
                style={{ marginTop: '24px' }}
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Secure Strip / Trust Strip */}
            <div className="trust-strip">
              <div className="trust-item">
                <HiOutlineLockClosed />
                <span>Secure Checkout powered by SSL encryption</span>
              </div>
              <div className="trust-item">
                <HiOutlineRefresh />
                <span>Complimentary 14-day hassle-free returns</span>
              </div>
              <div className="trust-item">
                <HiOutlineTruck />
                <span>Free express shipping on all orders</span>
              </div>
            </div>

            {/* Need Help? Block (#3c) */}
            <div className="help-block">
              <div className="help-block__title">Need Help?</div>
              <div className="help-block__text">
                Our styling experts are here to assist you with sizing, fit, and recommendations.
              </div>
              <Link to="/contact" className="help-block__link">Contact Support →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
