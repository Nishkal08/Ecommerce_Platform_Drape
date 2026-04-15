import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, verifyPayment } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/formatDate';
import { HiCheck } from 'react-icons/hi';

const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
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
        window.location.reload();
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
            window.location.reload();
          } catch {
            setVerifying(false);
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: order.shippingAddress?.name, contact: order.shippingAddress?.phone },
        theme: { color: '#1A1A1A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment');
    }
  };

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
        <div className="page-header">
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
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
          <div style={{ textAlign: 'center', padding: '24px', background: '#ffebee', borderRadius: '8px', marginBottom: '32px' }}>
            <span className="badge badge--error">Order Cancelled</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Items */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>Items</h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                <img src={item.image || item.product?.images?.[0]?.url} alt={item.name} style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</div>
                  {item.size && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Size: {item.size}</div>}
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>Summary</h3>
            <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '24px' }}>
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

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '24px', marginBottom: '12px' }}>Shipping Address</h3>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
              <div>{order.shippingAddress?.name}</div>
              <div>{order.shippingAddress?.line1}</div>
              <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</div>
              <div>Phone: {order.shippingAddress?.phone}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
          <Link to="/orders" className="btn btn--outline">← Back to Orders</Link>
          {order.status === 'pending' && (
            <button onClick={handlePay} className="btn btn--primary">
              Pay Now ({formatPrice(order.total)})
            </button>
          )}
          {['paid', 'processing', 'shipped', 'delivered'].includes(order.status) && (
            <Link to={`/orders/${order._id}/invoice`} target="_blank" className="btn btn--primary">
              Download Invoice
            </Link>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default OrderDetailPage;
