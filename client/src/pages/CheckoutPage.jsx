import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, verifyPayment } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, cartTotal, clearAllItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const couponApplied = location.state?.couponApplied || null;
  const discount = couponApplied?.discount || 0;
  const total = Math.max(cartTotal - discount, 0);

  const [address, setAddress] = useState({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    if (!address.name || !address.line1 || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error('Please fill all address fields'); return;
    }
    setLoading(true);
    try {
      const orderRes = await createOrder({ shippingAddress: address, couponApplied });
      const { razorpay_order_id, amount, key_id } = orderRes.data.data;

      // Check if Razorpay key is a placeholder
      if (!key_id || key_id === 'your_razorpay_key_id') {
        // Dev mode: simulate payment
        await verifyPayment({
          razorpay_order_id,
          razorpay_payment_id: 'dev_pay_' + Date.now(),
          razorpay_signature: 'dev_signature',
        });
        toast.success('Order placed successfully! (Dev mode)');
        navigate(`/orders/${orderRes.data.data.order._id}`);
        return;
      }

      // Production: Open Razorpay modal
      const options = {
        key: key_id,
        amount,
        currency: 'INR',
        name: 'DRAPE',
        description: 'Fashion Purchase',
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            setVerifying(true);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            navigate(`/orders/${orderRes.data.data.order._id}`);
          } catch {
            setVerifying(false);
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#1A1A1A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add items before checking out.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {verifying && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ marginBottom: '24px' }}></div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>Securing your payment...</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Please don't close this window.</p>
        </div>
      )}
      <div className="page">
        <div className="page-header"><h1>Checkout</h1></div>
        <div className="page-content">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Shipping Form */}
          <form onSubmit={handlePay} className="flex-1 w-full">
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Shipping Address
            </h3>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" className="form-input" value={address.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address Line</label>
              <input name="line1" className="form-input" value={address.line1} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>City</label>
                <input name="city" className="form-input" value={address.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input name="state" className="form-input" value={address.state} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Pincode</label>
                <input name="pincode" className="form-input" value={address.pincode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" className="form-input" value={address.phone} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0" style={{ background: 'var(--surface)', borderRadius: '8px', padding: '32px', height: 'fit-content' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Order Summary
            </h3>
            {cart.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>
                  {item.product?.name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                </span>
                <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CheckoutPage;
