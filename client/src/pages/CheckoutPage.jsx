import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, verifyPayment } from '../services/orderService';
import { addAddress } from '../services/authService';
import { formatPrice } from '../utils/formatPrice';
import { HiOutlineMapPin, HiOutlineCreditCard, HiOutlineCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, cartTotal, clearAllItems } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const couponApplied = location.state?.couponApplied || null;
  const discount = couponApplied?.discount || 0;
  const total = Math.max(cartTotal - discount, 0);

  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment Method, 3: Confirmation
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [address, setAddress] = useState({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // online or cod

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Set default address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
      setAddress({
        name: defaultAddr.name,
        line1: defaultAddr.line1,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
        phone: defaultAddr.phone
      });
    } else {
      setSelectedAddressId('new');
    }
  }, [user]);

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddress({ name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
    } else {
      const selected = user.addresses.find(a => a._id === addrId);
      if (selected) {
        setAddress({
          name: selected.name,
          line1: selected.line1,
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode,
          phone: selected.phone
        });
      }
    }
  };

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const validateAddress = () => {
    if (!address.name || !address.line1 || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error('Please fill all address fields');
      return false;
    }
    return true;
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!validateAddress()) return;
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Save address to profile if checked
      if (selectedAddressId === 'new' && saveToProfile) {
        try {
          const addrRes = await addAddress(address);
          if (setUser) setUser(addrRes.data.data);
        } catch { /* Silent fail for profile address saving */ }
      }

      // 2. Create the order
      const orderRes = await createOrder({
        shippingAddress: address,
        couponApplied,
        paymentMethod
      });

      // 3. Handle COD vs Razorpay
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully! (Cash on Delivery)');
        clearAllItems();
        navigate(`/orders/${orderRes.data.data.order._id}`);
        return;
      }

      // Online payment handling
      const { razorpay_order_id, amount, key_id } = orderRes.data.data;

      // Dev mode: simulate payment if key is dummy/placeholder or if server returned a mock dev order id
      if (!key_id || key_id === 'your_razorpay_key_id' || razorpay_order_id.startsWith('dev_')) {
        await verifyPayment({
          razorpay_order_id,
          razorpay_payment_id: 'dev_pay_' + Date.now(),
          razorpay_signature: 'dev_signature',
        });
        toast.success('Order placed successfully! (Payment simulated)');
        clearAllItems();
        navigate(`/orders/${orderRes.data.data.order._id}`);
        return;
      }

      // Production Razorpay Flow
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
            clearAllItems();
            navigate(`/orders/${orderRes.data.data.order._id}`);
          } catch {
            setVerifying(false);
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#B05C42' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed');
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(250, 249, 246, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-small" style={{ width: '40px', height: '40px', marginBottom: '24px' }}></div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>Securing your payment...</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Please do not close or refresh this page.</p>
        </div>
      )}

      <div className="page">
        <div className="page-content" style={{ maxWidth: '1200px' }}>
          
          {/* Checkout Stepper UI */}
          <div className="checkout-stepper">
            <div className={`checkout-step ${step >= 1 ? 'checkout-step--active' : ''}`}>
              <span className="checkout-step__badge"><HiOutlineMapPin /></span>
              <span className="checkout-step__title">Shipping Address</span>
            </div>
            <div className="checkout-stepper__line"></div>
            <div className={`checkout-step ${step >= 2 ? 'checkout-step--active' : ''}`}>
              <span className="checkout-step__badge"><HiOutlineCreditCard /></span>
              <span className="checkout-step__title">Payment Method</span>
            </div>
            <div className="checkout-stepper__line"></div>
            <div className={`checkout-step ${step >= 3 ? 'checkout-step--active' : ''}`}>
              <span className="checkout-step__badge"><HiOutlineCheckCircle /></span>
              <span className="checkout-step__title">Confirmation</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12" style={{ marginTop: '40px' }}>
            
            {/* Steps Content */}
            <div className="flex-1 w-full min-w-0">
              
              {/* STEP 1: SHIPPING ADDRESS */}
              {step === 1 && (
                <form onSubmit={handleNextToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Where should we ship your order?
                  </h3>

                  {/* Saved Addresses List */}
                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="saved-addresses-list">
                      {user.addresses.map((addr) => (
                        <label key={addr._id} className={`saved-address-card ${selectedAddressId === addr._id ? 'saved-address-card--selected' : ''}`}>
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddressId === addr._id}
                            onChange={() => handleAddressSelect(addr._id)}
                            style={{ display: 'none' }}
                          />
                          <div className="saved-address-card__content">
                            <span className="saved-address-card__name">{addr.name}</span>
                            <span className="saved-address-card__text">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</span>
                            <span className="saved-address-card__phone">Phone: {addr.phone}</span>
                            {addr.isDefault && <span className="saved-address-card__badge-default">Default</span>}
                          </div>
                        </label>
                      ))}
                      <label className={`saved-address-card ${selectedAddressId === 'new' ? 'saved-address-card--selected' : ''}`}>
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === 'new'}
                          onChange={() => handleAddressSelect('new')}
                          style={{ display: 'none' }}
                        />
                        <div className="saved-address-card__content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>+ Use a different address</span>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Address input fields */}
                  {(selectedAddressId === 'new' || !user?.addresses || user.addresses.length === 0) && (
                    <div className="address-inputs-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                      {user && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>
                          <input
                            type="checkbox"
                            checked={saveToProfile}
                            onChange={(e) => setSaveToProfile(e.target.checked)}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          Save this address to my profile
                        </label>
                      )}
                    </div>
                  )}

                  <button type="submit" className="btn btn--primary btn--full btn--lg" style={{ marginTop: '12px' }}>
                    Continue to Payment
                  </button>
                </form>
              )}

              {/* STEP 2: PAYMENT METHOD */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Select Payment Method
                  </h3>

                  <div className="payment-methods-grid">
                    <label className={`payment-method-card ${paymentMethod === 'online' ? 'payment-method-card--selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        style={{ display: 'none' }}
                      />
                      <div className="payment-method-card__content">
                        <span className="payment-method-card__title">Pay Online (Razorpay)</span>
                        <span className="payment-method-card__desc">Secure payment via UPI, Credit/Debit cards, Net Banking, or Wallets</span>
                      </div>
                    </label>

                    <label className={`payment-method-card ${paymentMethod === 'cod' ? 'payment-method-card--selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        style={{ display: 'none' }}
                      />
                      <div className="payment-method-card__content">
                        <span className="payment-method-card__title">Cash on Delivery (COD)</span>
                        <span className="payment-method-card__desc">Pay with cash when your package is delivered to your doorstep</span>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <button onClick={() => setStep(1)} className="btn btn--outline btn--sm" style={{ flex: 1 }}>
                      Back to Address
                    </button>
                    <button onClick={() => setStep(3)} className="btn btn--primary btn--sm" style={{ flex: 1 }}>
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER CONFIRMATION */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Confirm Your Order
                  </h3>

                  <div className="review-order-panel">
                    <div className="review-order-section">
                      <h4>Delivery Address</h4>
                      <p>{address.name}</p>
                      <p>{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
                      <p>Phone: {address.phone}</p>
                    </div>

                    <div className="review-order-section" style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                      <h4>Payment Mode</h4>
                      <p>{paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <button onClick={() => setStep(2)} className="btn btn--outline btn--sm" style={{ flex: 1 }} disabled={loading}>
                      Back to Payment
                    </button>
                    <button onClick={handlePlaceOrder} className="btn btn--primary btn--sm" style={{ flex: 1 }} disabled={loading}>
                      {loading ? 'Placing Order...' : `Place Order · ${formatPrice(total)}`}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Order Summary Right Panel */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="cart-summary-card--sticky">
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Order Summary
                </h3>

                <div className="checkout-summary-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cart.items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={item.product?.images?.[0]?.url}
                        alt={item.product?.name}
                        style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '3px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product?.name}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Size: {item.size || 'N/A'} · Qty: {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '20px', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                    <span style={{ fontWeight: '500' }}>{formatPrice(cartTotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: 'var(--success)' }}>
                      <span>Discount ({couponApplied?.code})</span>
                      <span style={{ fontWeight: '500' }}>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--muted)' }}>Shipping</span>
                    <span style={{ color: 'var(--success)', fontWeight: '500' }}>Free</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
                  </div>
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
