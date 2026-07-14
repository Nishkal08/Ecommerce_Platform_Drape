import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineLockClosed, HiOutlineRefresh } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { validateCoupon } from '../services/couponService';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, cartTotal, updateItem, removeItem, clearAllItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showPromo, setShowPromo] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: cartTotal });
      setCouponDiscount(res.data.data.discount);
      setAppliedCoupon(res.data.data);
      toast.success(`Coupon applied! You save ${formatPrice(res.data.data.discount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    if (!user) { 
      toast.error('Please sign in to proceed to checkout');
      navigate('/login', { state: { from: location } }); 
      return; 
    }
    navigate('/checkout', { state: { couponApplied: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null } });
  };

  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="page-content">
          {/* Breadcrumb */}
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

        {/* Stitch line divider */}
        <hr className="divider--stitch" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="flex-1 w-full">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-row">
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
                  {item.size && <span className="cart-row__meta">Size: {item.size}</span>}
                  <span className="cart-row__price">{formatPrice(item.product?.price)}</span>
                </div>
                
                <div className="cart-row__controls">
                  <div className="qty-stepper--unified">
                    <button onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItem(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item._id)} className="cart-row__remove" title="Remove item">
                    <HiOutlineTrash />
                  </button>
                </div>
                
                <div className="cart-row__total">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={clearAllItems} className="btn btn--outline btn--sm">
                Clear Cart
              </button>
              <Link to="/products" className="btn btn--outline btn--sm" style={{ textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>
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
                >
                  {showPromo ? 'Hide promo code' : 'Have a promo code?'}
                </button>
                <div className={`promo-panel-collapsible ${showPromo ? 'promo-panel-collapsible--open' : ''}`}>
                  <div className="coupon-input-group">
                    <input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button className="coupon-input-group__btn" onClick={handleApplyCoupon}>Apply</button>
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: '500' }}>Free</span>
              </div>
              
              <div className="cart-summary-card__row-total">
                <span>Total</span>
                <span>{formatPrice(Math.max(cartTotal - couponDiscount, 0))}</span>
              </div>
              
              <button className="btn btn--primary btn--full btn--lg" onClick={handleCheckout} style={{ marginTop: '24px' }}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
