import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, verifyPayment, cancelOrder } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { formatDateTime } from '../utils/formatDate';
import { HiCheck, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) return <div className="page"><div className="spinner spinner--center" /></div>;
  if (!order) return <div className="page"><div className="page-content"><div className="empty-state"><h3>Order not found</h3></div></div></div>;

  const currentStepIdx = order.status === 'cancelled' ? -1 : STEPS.indexOf(order.status);

  const handlePay = async () => {
    try {
      const { razorpay_order_id } = order.paymentInfo;
      const amount = order.total * 100; // Razorpay needs paise
      const key_id = order.razorpay_key_id;

      // Check if Razorpay key is a placeholder
      if (!key_id || key_id === 'your_razorpay_key_id') {
        // Dev mode: simulate payment
        await verifyPayment({
          razorpay_order_id,
          razorpay_payment_id: 'dev_pay_' + Date.now(),
          razorpay_signature: 'dev_signature',
        });
        toast.success('Payment simulated successfully! (Dev mode)');
        loadOrder();
        return;
      }

      // Production: Open Razorpay modal
      const options = {
        key: key_id,
        amount,
        currency: 'INR',
        name: 'DRAPE',
        description: 'Order Payment',
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            setVerifying(true);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Your invoice has been emailed.');
            loadOrder();
          } catch {
            setVerifying(false);
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: order.shippingAddress?.name, contact: order.shippingAddress?.phone },
        theme: { color: '#B05C42' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(order._id);
      toast.success('Order cancelled successfully');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    try {
      for (const item of order.items) {
        // Adding each item to cart (default to size specified or empty)
        await addItem(item.product?._id || item.product, item.quantity, item.size || '');
      }
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch {
      toast.error('Failed to reorder items');
    }
  };

  return (
    <>
      {verifying && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(250, 249, 246, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-small" style={{ width: '40px', height: '40px', marginBottom: '24px' }}></div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px' }}>Securing your payment...</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Please don't close this window.</p>
        </div>
      )}
      <div className="page">
        <div className="page-header">
          <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="page-content">
          {/* Status Timeline */}
          {order.status !== 'cancelled' ? (
            <div className="status-timeline" style={{ marginBottom: '48px' }}>
              {STEPS.map((step, i) => (
                <div key={step} className={`status-step ${i <= currentStepIdx ? (i < currentStepIdx ? 'status-step--completed' : 'status-step--active') : ''}`}>
                  {i < STEPS.length - 1 && <div className="status-step__line" />}
                  <div className="status-step__dot">
                    {i < currentStepIdx ? <HiCheck /> : ''}
                  </div>
                  <span className="status-step__label">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', background: '#ffebee', borderRadius: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--error)', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600' }}>
              <HiX style={{ fontSize: '18px' }} />
              <span>THIS ORDER HAS BEEN CANCELLED</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="account-grid">
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 768px) {
                .account-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
              }
            `}} />
            
            {/* Items */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>Items</h3>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                  <img src={item.image || item.product?.images?.[0]?.url} alt={item.name} style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    {item.size && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Size: {item.size}</div>}
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>Summary</h3>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--muted)' }}>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: 'var(--success)' }}>
                    <span>Discount {order.couponApplied?.code && `(${order.couponApplied.code})`}</span><span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span>Total</span><span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>Shipping Address</h3>
              <div style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '600', color: 'var(--charcoal)' }}>{order.shippingAddress?.name}</div>
                <div>{order.shippingAddress?.line1}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</div>
                <div style={{ marginTop: '4px' }}>Phone: {order.shippingAddress?.phone}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn--outline btn--sm">← Back to Orders</Link>
            
            {order.status === 'pending' && (
              <button onClick={handlePay} className="btn btn--primary btn--sm">
                Pay Now ({formatPrice(order.total)})
              </button>
            )}
            
            {['paid', 'processing', 'shipped', 'delivered'].includes(order.status) && (
              <Link to={`/orders/${order._id}/invoice`} target="_blank" className="btn btn--outline btn--sm">
                Download Invoice
              </Link>
            )}

            {/* Cancel Button */}
            {(order.status === 'pending' || order.status === 'processing') && (
              <button
                onClick={handleCancelOrder}
                className="btn btn--danger btn--sm"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            {/* Reorder Button */}
            {order.status !== 'pending' && (
              <button onClick={handleReorder} className="btn btn--primary btn--sm">
                Reorder Items
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
