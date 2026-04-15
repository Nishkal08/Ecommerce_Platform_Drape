import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiTrash } from 'react-icons/hi';
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

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="page-content">
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
      <div className="page-header"><h1>Shopping Cart</h1></div>
      <div className="page-content">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-1 w-full">
            {cart.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                <Link to={`/products/${item.product?.slug}`}>
                  <img src={item.product?.images?.[0]?.url} alt={item.product?.name} style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '4px' }} />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product?.slug}`} style={{ fontSize: '15px', fontWeight: '500' }}>
                    {item.product?.name}
                  </Link>
                  {item.size && <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Size: {item.size}</p>}
                  <p style={{ fontWeight: '600', marginTop: '8px' }}>{formatPrice(item.product?.price)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                    <div className="qty-stepper">
                      <button onClick={() => item.quantity > 1 && updateItem(item._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '16px', cursor: 'pointer' }}>
                      <HiTrash />
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: '600' }}>
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </div>
              </div>
            ))}
            <button onClick={clearAllItems} className="btn btn--outline btn--sm" style={{ marginTop: '16px' }}>
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0" style={{ background: 'var(--surface)', borderRadius: '8px', padding: '32px', height: 'fit-content', position: 'sticky', top: '96px' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Order Summary
            </h3>

            {/* Coupon */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input
                className="form-input"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn--outline btn--sm" onClick={handleApplyCoupon}>Apply</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--success)' }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border)', marginTop: '12px', fontWeight: '700', fontSize: '18px' }}>
              <span>Total</span>
              <span>{formatPrice(Math.max(cartTotal - couponDiscount, 0))}</span>
            </div>
            <button className="btn btn--primary btn--full btn--lg" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
